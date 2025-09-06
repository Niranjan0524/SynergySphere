const { executeQuery, executeTransaction } = require('./database');

/**
 * Invitation Model - handles all invitation-related database operations
 */
class Invitation {

  /**
   * Create a new invitation
   */
  static async create(invitationData) {
    const { user_id_from, user_id_to, project_id } = invitationData;
    
    // Check if invitation already exists
    const existingQuery = `
      SELECT invitation_id FROM Invitations 
      WHERE user_id_from = ? AND user_id_to = ? AND project_id = ? AND status = 'pending'
    `;
    const existing = await executeQuery(existingQuery, [user_id_from, user_id_to, project_id]);
    
    if (existing.success && existing.data.length > 0) {
      throw new Error('Invitation already exists for this user and project');
    }
    
    const query = `
      INSERT INTO Invitations (user_id_from, user_id_to, project_id) 
      VALUES (?, ?, ?)
    `;
    
    const result = await executeQuery(query, [user_id_from, user_id_to, project_id]);
    
    if (result.success) {
      return await Invitation.findById(result.data.insertId);
    }
    return null;
  }

  /**
   * Find invitation by ID
   */
  static async findById(invitationId) {
    const query = `
      SELECT i.*, 
             uf.name as from_name, uf.email as from_email, uf.profile_image as from_avatar,
             ut.name as to_name, ut.email as to_email, ut.profile_image as to_avatar,
             p.name as project_name, p.description as project_description
      FROM Invitations i
      JOIN Users uf ON i.user_id_from = uf.user_id
      JOIN Users ut ON i.user_id_to = ut.user_id
      JOIN Projects p ON i.project_id = p.project_id
      WHERE i.invitation_id = ?
    `;
    
    const result = await executeQuery(query, [invitationId]);
    return result.success && result.data.length > 0 ? result.data[0] : null;
  }

  /**
   * Get invitations for a user
   */
  static async getForUser(userId, type = 'received', status = null, limit = 20, offset = 0) {
    let query = `
      SELECT i.*, 
             uf.name as from_name, uf.email as from_email, uf.profile_image as from_avatar,
             ut.name as to_name, ut.email as to_email, ut.profile_image as to_avatar,
             p.name as project_name, p.description as project_description
      FROM Invitations i
      JOIN Users uf ON i.user_id_from = uf.user_id
      JOIN Users ut ON i.user_id_to = ut.user_id
      JOIN Projects p ON i.project_id = p.project_id
    `;
    
    const conditions = [];
    const params = [];
    
    if (type === 'received') {
      conditions.push('i.user_id_to = ?');
      params.push(userId);
    } else if (type === 'sent') {
      conditions.push('i.user_id_from = ?');
      params.push(userId);
    }
    
    if (status) {
      conditions.push('i.status = ?');
      params.push(status);
    }
    
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    
    query += ' ORDER BY i.sent_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);
    
    const result = await executeQuery(query, params);
    return result.success ? result.data : [];
  }

  /**
   * Respond to invitation (accept/decline)
   */
  static async respond(invitationId, userId, response) {
    const validResponses = ['accepted', 'declined'];
    if (!validResponses.includes(response)) {
      throw new Error('Invalid response. Must be "accepted" or "declined"');
    }
    
    // Verify the invitation belongs to the user
    const invitation = await Invitation.findById(invitationId);
    if (!invitation || invitation.user_id_to !== userId) {
      throw new Error('Invitation not found or unauthorized');
    }
    
    if (invitation.status !== 'pending') {
      throw new Error('Invitation has already been responded to');
    }
    
    const queries = [
      {
        query: 'UPDATE Invitations SET status = ?, responded_at = CURRENT_TIMESTAMP WHERE invitation_id = ?',
        params: [response, invitationId]
      }
    ];
    
    // If accepted, add user to project
    if (response === 'accepted') {
      queries.push({
        query: 'INSERT INTO ProjectTaskUser (project_id, user_id, task_id, role) SELECT ?, ?, 0, "member" WHERE NOT EXISTS (SELECT 1 FROM ProjectTaskUser WHERE project_id = ? AND user_id = ?)',
        params: [invitation.project_id, userId, invitation.project_id, userId]
      });
    }
    
    const result = await executeTransaction(queries);
    return result.success;
  }

  /**
   * Delete invitation
   */
  static async delete(invitationId, userId) {
    // Verify the invitation belongs to the sender
    const invitation = await Invitation.findById(invitationId);
    if (!invitation || invitation.user_id_from !== userId) {
      throw new Error('Invitation not found or unauthorized');
    }
    
    const query = 'DELETE FROM Invitations WHERE invitation_id = ?';
    const result = await executeQuery(query, [invitationId]);
    return result.success;
  }

  /**
   * Get invitation statistics for a user
   */
  static async getStats(userId) {
    const queries = [
      'SELECT COUNT(*) as sent_count FROM Invitations WHERE user_id_from = ?',
      'SELECT COUNT(*) as received_count FROM Invitations WHERE user_id_to = ?',
      'SELECT COUNT(*) as pending_sent FROM Invitations WHERE user_id_from = ? AND status = "pending"',
      'SELECT COUNT(*) as pending_received FROM Invitations WHERE user_id_to = ? AND status = "pending"'
    ];
    
    const stats = {};
    
    for (const query of queries) {
      const result = await executeQuery(query, [userId]);
      if (result.success) {
        const key = query.match(/as (\w+)/)[1];
        stats[key] = result.data[0][key] || 0;
      }
    }
    
    return stats;
  }
}

module.exports = Invitation;
