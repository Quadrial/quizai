import type { Quiz, StudyMaterial, User } from '../types'

interface QuizAttempt {
  id: string
  quizId: string
  userId: string
  answers: number[]
  score: number
  completedAt: string
}

export class LocalStorageService {
  private readonly USERS_KEY = 'quizai_users'
  private readonly QUIZZES_KEY = 'quizai_quizzes'
  private readonly MATERIALS_KEY = 'quizai_materials'
  private readonly ATTEMPTS_KEY = 'quizai_attempts'
  private readonly CURRENT_USER_KEY = 'quizai_current_user'

  // User management
  async signUp(email: string, password: string): Promise<User> {
    const users = this.getUsers()
    
    // Check if user already exists
    if (users.find(u => u.email === email)) {
      throw new Error('User already exists')
    }

    const newUser: User = {
      id: crypto.randomUUID(),
      email,
      isGuest: false
    }

    users.push({ ...newUser, password })
    localStorage.setItem(this.USERS_KEY, JSON.stringify(users))
    localStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify(newUser))
    
    return newUser
  }

  async signIn(email: string, password: string): Promise<User> {
    const users = this.getUsers()
    const user = users.find(u => u.email === email && u.password === password)
    
    if (!user) {
      throw new Error('Invalid email or password')
    }

    const userWithoutPassword: User = {
      id: user.id,
      email: user.email,
      isGuest: false
    }

    localStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify(userWithoutPassword))
    return userWithoutPassword
  }

  async signOut(): Promise<void> {
    localStorage.removeItem(this.CURRENT_USER_KEY)
  }

  getCurrentUser(): User | null {
    const stored = localStorage.getItem(this.CURRENT_USER_KEY)
    return stored ? JSON.parse(stored) : null
  }

  createGuestUser(): User {
    const guestUser: User = {
      id: `guest-${crypto.randomUUID()}`,
      isGuest: true
    }
    localStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify(guestUser))
    return guestUser
  }

  // Quiz operations
  async saveQuiz(quiz: Quiz, userId: string): Promise<void> {
    const quizzes = this.getStoredQuizzes()
    const quizWithUser = { ...quiz, userId }
    
    // Remove existing quiz with same ID
    const filtered = quizzes.filter(q => q.id !== quiz.id)
    filtered.push(quizWithUser)
    
    localStorage.setItem(this.QUIZZES_KEY, JSON.stringify(filtered))
  }

  async getQuizzes(userId: string): Promise<Quiz[]> {
    const quizzes = this.getStoredQuizzes()
    return quizzes
      .filter(q => q.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }

  async getQuiz(quizId: string, userId: string): Promise<Quiz | null> {
    const quizzes = this.getStoredQuizzes()
    return quizzes.find(q => q.id === quizId && q.userId === userId) || null
  }

  async deleteQuiz(quizId: string, userId: string): Promise<void> {
    const quizzes = this.getStoredQuizzes()
    const filtered = quizzes.filter(q => !(q.id === quizId && q.userId === userId))
    localStorage.setItem(this.QUIZZES_KEY, JSON.stringify(filtered))
  }

  // Study material operations
  async saveMaterial(material: StudyMaterial, userId: string): Promise<void> {
    const materials = this.getStoredMaterials()
    const materialWithUser = { ...material, userId }
    
    // Remove existing material with same ID
    const filtered = materials.filter(m => m.id !== material.id)
    filtered.push(materialWithUser)
    
    localStorage.setItem(this.MATERIALS_KEY, JSON.stringify(filtered))
  }

  async getMaterials(userId: string): Promise<StudyMaterial[]> {
    const materials = this.getStoredMaterials()
    return materials
      .filter(m => m.userId === userId)
      .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime())
  }

  async getMaterial(materialId: string, userId: string): Promise<StudyMaterial | null> {
    const materials = this.getStoredMaterials()
    return materials.find(m => m.id === materialId && m.userId === userId) || null
  }

  async deleteMaterial(materialId: string, userId: string): Promise<void> {
    const materials = this.getStoredMaterials()
    const filtered = materials.filter(m => !(m.id === materialId && m.userId === userId))
    localStorage.setItem(this.MATERIALS_KEY, JSON.stringify(filtered))
  }

  // Quiz attempt operations
  async saveQuizAttempt(quizId: string, answers: number[], score: number, userId: string): Promise<void> {
    const attempts = this.getAttempts()
    const attempt: QuizAttempt = {
      id: crypto.randomUUID(),
      quizId,
      userId,
      answers,
      score,
      completedAt: new Date().toISOString()
    }
    
    attempts.push(attempt)
    localStorage.setItem(this.ATTEMPTS_KEY, JSON.stringify(attempts))
  }

  async getQuizAttempts(quizId: string, userId: string): Promise<QuizAttempt[]> {
    const attempts = this.getAttempts()
    return attempts.filter(a => a.quizId === quizId && a.userId === userId)
  }

  // Private helper methods
  private getUsers(): Array<User & { password: string }> {
    const stored = localStorage.getItem(this.USERS_KEY)
    return stored ? JSON.parse(stored) : []
  }

  private getStoredQuizzes(): Array<Quiz & { userId: string }> {
    const stored = localStorage.getItem(this.QUIZZES_KEY)
    return stored ? JSON.parse(stored) : []
  }

  private getStoredMaterials(): Array<StudyMaterial & { userId: string }> {
    const stored = localStorage.getItem(this.MATERIALS_KEY)
    return stored ? JSON.parse(stored) : []
  }

  private getAttempts(): QuizAttempt[] {
    const stored = localStorage.getItem(this.ATTEMPTS_KEY)
    return stored ? JSON.parse(stored) : []
  }

  // Migration helper for existing guest data
  migrateGuestData(guestUserId: string, newUserId: string): void {
    // Migrate quizzes
    const quizzes = this.getStoredQuizzes()
    quizzes.forEach(quiz => {
      if (quiz.userId === guestUserId) {
        quiz.userId = newUserId
      }
    })
    localStorage.setItem(this.QUIZZES_KEY, JSON.stringify(quizzes))

    // Migrate materials
    const materials = this.getStoredMaterials()
    materials.forEach(material => {
      if (material.userId === guestUserId) {
        material.userId = newUserId
      }
    })
    localStorage.setItem(this.MATERIALS_KEY, JSON.stringify(materials))

    // Migrate attempts
    const attempts = this.getAttempts()
    attempts.forEach(attempt => {
      if (attempt.userId === guestUserId) {
        attempt.userId = newUserId
      }
    })
    localStorage.setItem(this.ATTEMPTS_KEY, JSON.stringify(attempts))
  }
}

export const localStorageService = new LocalStorageService()