'use server';

import prisma from '../lib/prisma';

export async function saveSolution(levelId: number, userName: string, codeText: string) {
  const lineCount = codeText.split('\n').filter(l => l.trim().length > 0).length;
  let stars = 1;
  if (lineCount <= 5) stars = 5;
  else if (lineCount <= 10) stars = 4;
  else if (lineCount <= 15) stars = 3;
  else if (lineCount <= 20) stars = 2;

  const solution = await prisma.solution.create({
    data: {
      levelId,
      userName: userName || 'Anónimo',
      codeText,
      stars,
    },
  });
  return solution;
}

export async function getSolutions(levelId: number) {
  return await prisma.solution.findMany({
    where: { levelId },
    orderBy: { createdAt: 'desc' },
    take: 5,
  });
}
