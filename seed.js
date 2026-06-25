generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

model User {
  id            String   @id @default(uuid())
  email         String   @unique
  password      String
  name          String
  role          String   @default("student")
  language      String   @default("english")
  background    String   @default("default")
  avatar        String   @default("👨‍🍳")
  stars         Int      @default(0)
  housePoints   Int      @default(0)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  enrollments    Enrollment[]
  quizAttempts   QuizAttempt[]
  gameScores     GameScore[]
  announcements  Announcement[]
  createdQuizzes Quiz[]
  classes        Class[]
  islandSessions IslandSession[]
}

model Class {
  id          String   @id @default(uuid())
  name        String
  description String?
  teacherId   String
  createdAt   DateTime @default(now())

  teacher      User         @relation(fields: [teacherId], references: [id])
  enrollments  Enrollment[]
  announcements Announcement[]
}

model Enrollment {
  id      String @id @default(uuid())
  userId  String
  classId String

  user  User  @relation(fields: [userId], references: [id])
  class Class @relation(fields: [classId], references: [id])

  @@unique([userId, classId])
}

model Quiz {
  id          String   @id @default(uuid())
  title       String
  subject     String
  year        Int
  questions   String
  timeLimit   Int?
  createdBy   String
  createdAt   DateTime @default(now())

  creator User          @relation(fields: [createdBy], references: [id])
  attempts QuizAttempt[]
}

model QuizAttempt {
  id         String   @id @default(uuid())
  userId     String
  quizId     String
  score      Int
  total      Int
  answers    String
  completed  Boolean  @default(false)
  createdAt  DateTime @default(now())

  user User @relation(fields: [userId], references: [id])
  quiz Quiz @relation(fields: [quizId], references: [id])

  @@unique([userId, quizId])
}

model Game {
  id        String   @id @default(uuid())
  title     String
  subject   String
  year      Int
  type      String
  config    String
  createdBy String?
  createdAt DateTime @default(now())

  scores GameScore[]
}

model GameScore {
  id        String   @id @default(uuid())
  userId    String
  gameId    String
  score     Int
  stars     Int      @default(0)
  createdAt DateTime @default(now())

  user User @relation(fields: [userId], references: [id])
  game Game @relation(fields: [gameId], references: [id])

  @@unique([userId, gameId])
}

model Announcement {
  id        String   @id @default(uuid())
  content   String
  teacherId String
  classId   String?
  type      String   @default("normal")
  createdAt DateTime @default(now())

  teacher User  @relation(fields: [teacherId], references: [id])
  class   Class? @relation(fields: [classId], references: [id])
}

model WorldIsland {
  id         String   @id @default(uuid())
  name       String
  type       String
  maxPlayers Int      @default(10)
  active     Boolean  @default(true)
  createdAt  DateTime @default(now())
  sessions   IslandSession[]
}

model IslandSession {
  id        String   @id @default(uuid())
  islandId  String
  userId    String
  userIds   String
  state     String   @default("waiting")
  createdAt DateTime @default(now())

  island WorldIsland @relation(fields: [islandId], references: [id])
  user   User        @relation(fields: [userId], references: [id])
}

model Lesson {
  id          String   @id @default(uuid())
  title       String
  subject     String
  year        Int
  content     String
  videoUrl    String?
  createdBy   String
  createdAt   DateTime @default(now())
}

model AdminAction {
  id        String   @id @default(uuid())
  type      String
  data      String?
  active    Boolean  @default(true)
  createdBy String
  createdAt DateTime @default(now())
}

model Homework {
  id          String   @id @default(uuid())
  title       String
  description String?
  subject     String
  year        Int
  dueDate     String
  questions   String
  createdBy   String
  createdAt   DateTime @default(now())
  submissions HomeworkSubmission[]
}

model HomeworkSubmission {
  id         String   @id @default(uuid())
  homeworkId String
  userId     String
  answers    String
  score      Int?
  feedback   String?
  submitted  Boolean  @default(false)
  createdAt  DateTime @default(now())

  homework Homework @relation(fields: [homeworkId], references: [id])
}
