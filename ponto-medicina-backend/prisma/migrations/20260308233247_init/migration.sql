-- CreateTable
CREATE TABLE "Usuario" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "senha" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'STAFF',
    "perfil" TEXT NOT NULL,
    "totp_secret" TEXT,
    "cnesVinculado" TEXT,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Aluno" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "matricula" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "turma" TEXT,
    "carga_horaria_alvo" INTEGER NOT NULL DEFAULT 120,
    "horas_concluidas" REAL NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'ativo',
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Setor" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "hospital" TEXT NOT NULL,
    "cnes" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Ponto" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "aluno_id" TEXT NOT NULL,
    "setor_id" TEXT,
    "setor_nome" TEXT,
    "data_plantao" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "hora_entrada" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "hora_saida" DATETIME,
    "horas_totais" REAL,
    "staff_entrada_id" TEXT NOT NULL,
    "staff_saida_id" TEXT,
    "is_sos_entrada" BOOLEAN NOT NULL DEFAULT false,
    "is_sos_saida" BOOLEAN NOT NULL DEFAULT false,
    "observacao" TEXT,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Ponto_aluno_id_fkey" FOREIGN KEY ("aluno_id") REFERENCES "Aluno" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Ponto_setor_id_fkey" FOREIGN KEY ("setor_id") REFERENCES "Setor" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Ponto_staff_entrada_id_fkey" FOREIGN KEY ("staff_entrada_id") REFERENCES "Usuario" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Ponto_staff_saida_id_fkey" FOREIGN KEY ("staff_saida_id") REFERENCES "Usuario" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Escala" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "aluno_id" TEXT NOT NULL,
    "aluno_nome" TEXT NOT NULL,
    "staff_id" TEXT NOT NULL,
    "staff_nome" TEXT NOT NULL,
    "setor_id" TEXT,
    "setor_nome" TEXT,
    "cnes" TEXT,
    "hospital" TEXT,
    "data" TEXT NOT NULL,
    "periodo" TEXT NOT NULL,
    "carga_horaria" REAL NOT NULL DEFAULT 6,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Escala_aluno_id_fkey" FOREIGN KEY ("aluno_id") REFERENCES "Aluno" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Escala_staff_id_fkey" FOREIGN KEY ("staff_id") REFERENCES "Usuario" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Escala_setor_id_fkey" FOREIGN KEY ("setor_id") REFERENCES "Setor" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Aluno_matricula_key" ON "Aluno"("matricula");
