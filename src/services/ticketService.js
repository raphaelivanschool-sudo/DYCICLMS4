const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

class TicketService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // Get auth token
  getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  }

  // Get all tickets for current user
  async getMyTickets() {
    try {
      const response = await fetch(`${this.baseURL}/api/tickets`, {
        headers: this.getAuthHeaders()
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch tickets');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching tickets:', error);
      throw error;
    }
  }

  // Get tickets pending approval (for instructors)
  async getPendingApprovalTickets() {
    try {
      const response = await fetch(`${this.baseURL}/api/tickets/pending-approval`, {
        headers: this.getAuthHeaders()
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch pending tickets');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching pending tickets:', error);
      throw error;
    }
  }

  // Get all tickets (for instructors/admins)
  async getAllTickets(filters = {}) {
    try {
      const queryParams = new URLSearchParams();
      if (filters.status) queryParams.append('status', filters.status);
      if (filters.priority) queryParams.append('priority', filters.priority);
      if (filters.category) queryParams.append('category', filters.category);
      
      const response = await fetch(`${this.baseURL}/api/tickets/all?${queryParams}`, {
        headers: this.getAuthHeaders()
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch tickets');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching all tickets:', error);
      throw error;
    }
  }

  // Create new ticket
  async createTicket(ticketData) {
    try {
      const response = await fetch(`${this.baseURL}/api/tickets`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(ticketData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create ticket');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error creating ticket:', error);
      throw error;
    }
  }

  // Approve ticket
  async approveTicket(ticketId, assignedTo = null) {
    try {
      const response = await fetch(`${this.baseURL}/api/tickets/${ticketId}/approve`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ assignedTo })
      });
      
      if (!response.ok) {
        throw new Error('Failed to approve ticket');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error approving ticket:', error);
      throw error;
    }
  }

  // Reject ticket
  async rejectTicket(ticketId, rejectionReason) {
    try {
      const response = await fetch(`${this.baseURL}/api/tickets/${ticketId}/reject`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ rejectionReason })
      });
      
      if (!response.ok) {
        throw new Error('Failed to reject ticket');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error rejecting ticket:', error);
      throw error;
    }
  }

  // Update ticket status
  async updateTicketStatus(ticketId, status) {
    try {
      const response = await fetch(`${this.baseURL}/api/tickets/${ticketId}/status`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ status })
      });
      
      if (!response.ok) {
        throw new Error('Failed to update ticket status');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error updating ticket status:', error);
      throw error;
    }
  }

  // Get ticket statistics for current user
  async getMyTicketStats() {
    try {
      const response = await fetch(`${this.baseURL}/api/tickets/stats/my`, {
        headers: this.getAuthHeaders()
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch ticket statistics');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching ticket statistics:', error);
      throw error;
    }
  }

  // Get ticket statistics for instructors
  async getInstructorTicketStats() {
    try {
      const response = await fetch(`${this.baseURL}/api/tickets/stats/instructor`, {
        headers: this.getAuthHeaders()
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch instructor ticket statistics');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching instructor ticket statistics:', error);
      throw error;
    }
  }
}

const ticketService = new TicketService();
export default ticketService;
