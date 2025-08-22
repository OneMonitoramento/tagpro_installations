import bcrypt from 'bcryptjs';

export interface AuthUser {
  id: string;
  username: string;
  password: string; // hasheada
  name: string;
  email: string;
  role: 'admin' | 'lwsim' | 'binsat' | 'tagpro' | 'user';
}

// Função para gerar hash de senha (usar apenas para criar/alterar senhas)
export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

// Função para verificar senha
export const verifyPassword = async (password: string, hashedPassword: string): Promise<boolean> => {
  return bcrypt.compare(password, hashedPassword);
};

// Usuários do sistema (senhas já hasheadas)
// Para gerar novos hashes, use: await hashPassword('suaSenha')
export const SYSTEM_USERS: AuthUser[] = [
  {
    id: '1',
    username: 'admin',
    password: '$2b$10$WRARVWM5q5HuX9fJrjTUJOcEAKpOhnQzVmEXpUBPeJtU2mfIEOMDi', // admin123
    name: 'Administrador',
    email: 'admin@empresa.com',
    role: 'admin'
  },
  {
    id: '2', 
    username: 'lwsim',
    password: '$2b$10$g887c4XZLd8O9NMaC8BL0eh60hOfW2Pi6BMWDZTnBuVQpLQhAFbpa',
    name: 'LW SIM',
    email: 'lwsim@empresa.com', 
    role: 'lwsim'
  },
  {
    id: '3',
    username: 'binsat', 
    password: '$2b$10$eWdro6Cy/seWTC/r1FcLzejiG3r5GUVW4rtP5c71aXOdnrwjUxwZ.', 
    name: 'Binsat',
    email: 'binsat@empresa.com',
    role: 'binsat'
  },
  {
    id: '4',
    username: 'tagpro',
    password: '$2b$10$pIa.xel3rLrcmztJGWtfpeRs.ymNf80H.RvUfe2Zf0ScJ09cRLbFq',
    name: 'TagPro',
    email: 'tagpro@empresa.com',
    role: 'tagpro'
  },
  {
    id: '5',
    username: 'user',
    password: '$2b$10$Wjc0kWDpaRKKAm26llilnuU6MiiSXBRhnFCxL45UJFh3L5PuTpVUW', // user123
    name: 'Usuário Padrão', 
    email: 'user@empresa.com',
    role: 'user'
  }
];

// Função para buscar usuário por username
export const findUserByUsername = (username: string): AuthUser | null => {
  return SYSTEM_USERS.find(user => user.username === username) || null;
};

// Função para buscar usuário por ID
export const findUserById = (id: string): AuthUser | null => {
  return SYSTEM_USERS.find(user => user.id === id) || null;
};

// Função para autenticar usuário
export const authenticateUser = async (username: string, password: string): Promise<AuthUser | null> => {
  const user = findUserByUsername(username);
  if (!user) return null;
  
  const isValid = await verifyPassword(password, user.password);
  return isValid ? user : null;
};