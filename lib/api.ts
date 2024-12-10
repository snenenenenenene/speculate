// lib/api.ts

interface Project {
  id: string;
  name: string;
  description: string;
  _count: {
    charts: number;
  };
  updatedAt: string;
}

interface ApiResponse<T> {
  data: T;
  error?: string;
}

export async function fetchProjects(): Promise<ApiResponse<{ projects: Project[] }>> {
  try {
    const response = await fetch('/api/projects');
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch projects');
    }
    
    return { data };
  } catch (error) {
    console.error('Error fetching projects:', error);
    throw error;
  }
}

export async function createProject(name: string, description?: string): Promise<ApiResponse<{ project: Project }>> {
  try {
    const response = await fetch('/api/projects', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, description }),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to create project');
    }
    
    return { data };
  } catch (error) {
    console.error('Error creating project:', error);
    throw error;
  }
}

export async function fetchProject(projectId: string): Promise<ApiResponse<{ project: Project }>> {
  try {
    const response = await fetch(`/api/projects/${projectId}`);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch project');
    }
    
    return { data };
  } catch (error) {
    console.error('Error fetching project:', error);
    throw error;
  }
}

export async function updateProject(projectId: string, updates: Partial<Project>): Promise<ApiResponse<{ project: Project }>> {
  try {
    const response = await fetch(`/api/projects/${projectId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to update project');
    }
    
    return { data };
  } catch (error) {
    console.error('Error updating project:', error);
    throw error;
  }
}

export async function deleteProject(projectId: string): Promise<ApiResponse<void>> {
  try {
    const response = await fetch(`/api/projects/${projectId}`, {
      method: 'DELETE',
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to delete project');
    }
    
    return { data };
  } catch (error) {
    console.error('Error deleting project:', error);
    throw error;
  }
}
