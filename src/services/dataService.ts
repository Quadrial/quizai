
import { localStorageService } from './localStorageService'
import type { Quiz, StudyMaterial } from '../types'

export class DataService {
  // Quiz operations
  async saveQuiz(quiz: Quiz, userId?: string): Promise<void> {
    if (!userId) throw new Error('User ID is required')
    await localStorageService.saveQuiz(quiz, userId)
  }

  async getQuizzes(userId?: string): Promise<Quiz[]> {
    if (!userId) return []
    return await localStorageService.getQuizzes(userId)
  }

  async getQuiz(quizId: string, userId?: string): Promise<Quiz | null> {
    if (!userId) return null
    return await localStorageService.getQuiz(quizId, userId)
  }

  async deleteQuiz(quizId: string, userId?: string): Promise<void> {
    if (!userId) throw new Error('User ID is required')
    await localStorageService.deleteQuiz(quizId, userId)
  }

  // Study material operations
  async saveMaterial(material: StudyMaterial, userId?: string): Promise<void> {
    if (!userId) throw new Error('User ID is required')
    await localStorageService.saveMaterial(material, userId)
  }

  async getMaterials(userId?: string): Promise<StudyMaterial[]> {
    if (!userId) return []
    return await localStorageService.getMaterials(userId)
  }

  async getMaterial(materialId: string, userId?: string): Promise<StudyMaterial | null> {
    if (!userId) return null
    return await localStorageService.getMaterial(materialId, userId)
  }

  async deleteMaterial(materialId: string, userId?: string): Promise<void> {
    if (!userId) throw new Error('User ID is required')
    await localStorageService.deleteMaterial(materialId, userId)
  }

  // Quiz attempt operations
  async saveQuizAttempt(quizId: string, answers: number[], score: number, userId?: string): Promise<void> {
    if (!userId) throw new Error('User ID is required')
    await localStorageService.saveQuizAttempt(quizId, answers, score, userId)
  }
}

export const dataService = new DataService()