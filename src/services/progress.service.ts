// User progress tracking and use

import { PrismaClient } from '@prisma/client';

const db = new PrismaClient();

export interface Progress {
  userId: string;
  contentId: string;
  completion: number;
  quizScores: number[];
  lastAccessed: Date;
}

export class ProgressService {
  async updateProgress(progress: Progress): Promise<void> {
    // Add to database
    await db.progress.upsert({
      where: {
        userId_contentId: {
          userId: progress.userId,
          contentId: progress.contentId,
        }
      },
      update: progress,
      create: progress,
    });
  }

  async getProgress(userId: string, contentId: string): Promise<Progress | null> {
    return await db.progress.findUnique({
      where: {
        userId_contentId: {
          userId,
          contentId,
        }
      }
    });
  }
} 