import { MedicalRecord, FullProfile, AdminStats, User, RegistrationPayload } from '../types';

const BASE_URL = 'https://tohpitoh-api.onrender.com/api/v1';

// Helper for headers
const getHeaders = (token?: string) => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

// Error handling helper
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const errorBody = await response.text();
    // Try to parse JSON error if possible
    try {
        const jsonError = JSON.parse(errorBody);
        throw new Error(jsonError.message || `Erreur HTTP: ${response.status}`);
    } catch (e) {
        throw new Error(errorBody || `Erreur HTTP: ${response.status}`);
    }
  }
  return response.json();
};

export const api = {
  // --- AUTHENTICATION ---
  login: async (email: string, password: string) => {
    try {
      const response = await fetch(`${BASE_URL}/jwt/auth`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ email, password }),
      });
      return handleResponse(response);
    } catch (error) {
      console.error('API Login Error:', error);
      throw error;
    }
  },

  register: async (payload: RegistrationPayload) => {
    try {
      const response = await fetch(`${BASE_URL}/jwt/register`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(payload),
      });
      return handleResponse(response);
    } catch (error) {
      console.error('API Register Error:', error);
      throw error;
    }
  },

  // --- USER DATA ---
  getProfile: async (token: string): Promise<FullProfile> => {
    const rawData = await handleResponse(
      await fetch(`${BASE_URL}/jwt/profile`, { headers: getHeaders(token) })
    );

    // Normalize user data structure (handle nested 'data' or 'user' keys)
    // Some backends wrap the response, others return it directly.
    const userData = rawData.user || rawData.data || rawData;

    // Normalize Role: Handle missing role, mapped types, or admin flags
    // This fixes issues where role is undefined but is_staff/is_superuser exists
    if (!userData.role) {
        if (userData.is_superuser || userData.is_staff) {
            userData.role = 'admin';
        } else if (userData.user_type) {
            userData.role = userData.user_type;
        } else {
             // Default to 'user' if we can't determine, preventing undefined errors
             userData.role = 'user'; 
        }
    }

    let patientData = undefined;
    // Fetch patient details ONLY for patient/user roles (not admin, doctor, laboratory)
    if (userData.role === 'patient' || userData.role === 'user') {
        try {
            const patRes = await fetch(`${BASE_URL}/patients/profile`, {
                headers: getHeaders(token)
            });
            if(patRes.ok) {
                patientData = await patRes.json();
            }
        } catch (e) {
            // Silently fail - patient profile might not exist yet or endpoint not available
            console.warn("Info: Could not fetch specific patient details (might not exist yet).");
        }
    }

    return {
      user: userData,
      patient: patientData
    };
  },

  getMedicalRecords: async (token: string): Promise<MedicalRecord[]> => {
    try {
      const response = await fetch(`${BASE_URL}/patients/medical-records`, {
        headers: getHeaders(token),
      });
      if (!response.ok) return []; // Fail gracefully for lists
      const data = await response.json();
      // Handle different response formats
      return Array.isArray(data) ? data : (data.records || data.data || []);
    } catch (error) {
      console.error('Error fetching medical records:', error);
      return [];
    }
  },

  updateProfile: async (token: string, profileData: any) => {
    const response = await fetch(`${BASE_URL}/jwt/profile`, {
      method: 'PUT',
      headers: getHeaders(token),
      body: JSON.stringify(profileData),
    });
    return handleResponse(response);
  },

  // --- PATIENT SPECIFIC ---
  patient: {
    updatePatientInfo: async (token: string, patientData: any) => {
      const response = await fetch(`${BASE_URL}/patients/profile/me`, {
        method: 'PUT',
        headers: getHeaders(token),
        body: JSON.stringify(patientData),
      });
      return handleResponse(response);
    },

    getAccessPermissions: async (token: string) => {
      try {
        const response = await fetch(`${BASE_URL}/patients/granted-accesses`, {
          headers: getHeaders(token),
        });
        if (!response.ok) return [];
        const data = await response.json();
        return Array.isArray(data) ? data : data.data || [];
      } catch (error) {
        console.error('Error fetching permissions:', error);
        return [];
      }
    },

    grantPermission: async (token: string, permissionData: any) => {
      const response = await fetch(`${BASE_URL}/patients/grant`, {
        method: 'POST',
        headers: getHeaders(token),
        body: JSON.stringify(permissionData),
      });
      return handleResponse(response);
    },

    revokePermission: async (token: string, permissionId: number) => {
      const response = await fetch(`${BASE_URL}/patients/revoke/${permissionId}`, {
        method: 'DELETE',
        headers: getHeaders(token),
      });
      return handleResponse(response);
    },

    getAllDoctors: async (token: string) => {
      try {
        const response = await fetch(`${BASE_URL}/doctors`, {
          headers: getHeaders(token),
        });
        if (!response.ok) return [];
        const data = await response.json();
        return Array.isArray(data) ? data : data.data || [];
      } catch (error) {
        console.error('Error fetching doctors:', error);
        return [];
      }
    },
  },

  // --- DOCTOR SPECIFIC ---
  doctor: {
    getMyPatients: async (token: string) => {
      try {
        const response = await fetch(`${BASE_URL}/doctors`, {
          headers: getHeaders(token),
        });
        if (!response.ok) return [];
        const data = await response.json();
        return Array.isArray(data) ? data : data.data || [];
      } catch (error) {
        console.error('Error fetching doctor patients:', error);
        return [];
      }
    },

    createMedicalRecord: async (token: string, recordData: any) => {
      const response = await fetch(`${BASE_URL}/doctors/patients/${recordData.patient_id}/medical-records`, {
        method: 'POST',
        headers: getHeaders(token),
        body: JSON.stringify(recordData),
      });
      return handleResponse(response);
    },

    createPrescription: async (token: string, prescriptionData: any) => {
      const response = await fetch(`${BASE_URL}/doctors/prescriptions`, {
        method: 'POST',
        headers: getHeaders(token),
        body: JSON.stringify(prescriptionData),
      });
      return handleResponse(response);
    },

    orderLabTest: async (token: string, labTestData: any) => {
      const response = await fetch(`${BASE_URL}/doctors/lab-tests`, {
        method: 'POST',
        headers: getHeaders(token),
        body: JSON.stringify(labTestData),
      });
      return handleResponse(response);
    },
  },

  // --- LABORATORY SPECIFIC ---
  laboratory: {
    getPendingTests: async (token: string) => {
      try {
        const response = await fetch(`${BASE_URL}/laboratories/tests`, {
          headers: getHeaders(token),
        });
        if (!response.ok) return [];
        const data = await response.json();
        return Array.isArray(data) ? data : data.data || [];
      } catch (error) {
        console.error('Error fetching pending tests:', error);
        return [];
      }
    },

    startTest: async (token: string, testId: number) => {
      const response = await fetch(`${BASE_URL}/laboratories/update-exam-status`, {
        method: 'PUT',
        headers: getHeaders(token),
        body: JSON.stringify({ testId, status: 'in_progress' }),
      });
      return handleResponse(response);
    },

    completeTest: async (token: string, testId: number, results: any) => {
      const response = await fetch(`${BASE_URL}/laboratories/tests/${testId}/results`, {
        method: 'PUT',
        headers: getHeaders(token),
        body: JSON.stringify(results),
      });
      return handleResponse(response);
    },
  },

  // --- ADMIN NAMESPACE ---
  admin: {
    getStats: async (token: string): Promise<AdminStats> => {
      // Calling the real endpoint based on swagger
      const response = await fetch(`${BASE_URL}/admin/statistics`, {
        headers: getHeaders(token),
      });
      return handleResponse(response);
    },

    getAllUsers: async (token: string): Promise<User[]> => {
      const response = await fetch(`${BASE_URL}/admin/all-users`, {
        headers: getHeaders(token),
      });
      return handleResponse(response);
    },

    getPendingValidations: async (token: string) => {
      const response = await fetch(`${BASE_URL}/admin/pending-validations`, {
        headers: getHeaders(token),
      });
      return handleResponse(response);
    },

    validateProfessional: async (token: string, id: number, type: 'doctor' | 'laboratory', action: 'approve' | 'reject') => {
      // Constructing endpoint based on Swagger: /api/v1/admin/doctors/{id}/approve
      const endpoint = type === 'doctor' 
        ? `${BASE_URL}/admin/doctors/${id}/${action}`
        : `${BASE_URL}/admin/laboratories/${id}/${action}`;

      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: getHeaders(token),
      });
      return handleResponse(response);
    }
  }
};