import { BSON } from 'realm';

// ─── Status da Venda ─────────────────────────────────────────────────────────

export type VendaStatus = 'pendente' | 'parcial' | 'pago';

// ─── DTOs de criação (entrada de dados) ──────────────────────────────────────

export interface CreateClienteDTO {
  nome: string;
  telefone?: string;
}

export interface CreateProdutoDTO {
  nome: string;
  preco: number;
}

export interface CreateVendaDTO {
  produtoId: BSON.UUID;
  clienteId: BSON.UUID;
  valor: number;
  dataVenda: Date;
  descricao?: string;
}

export interface CreateReceitaDTO {
  vendaId: BSON.UUID;
  clienteId: BSON.UUID;
  valor: number;
  dataPagamento: Date;
}

// ─── DTOs de atualização ─────────────────────────────────────────────────────

export interface UpdateVendaDTO {
  valor?: number;
  dataVenda?: Date;
  descricao?: string;
  valorPago?: number;
  status?: VendaStatus;
}

export interface UpdateClienteDTO {
  nome?: string;
  telefone?: string;
}

export interface UpdateProdutoDTO {
  nome?: string;
  preco?: number;
}

// ─── Interfaces de leitura / ViewModel ───────────────────────────────────────

export interface ClienteView {
  id: string;
  nome: string;
  telefone?: string;
  createdAt: Date;
}

export interface ProdutoView {
  id: string;
  nome: string;
  preco: number;
  createdAt: Date;
}

export interface VendaView {
  id: string;
  produtoId: string;
  clienteId: string;
  valor: number;
  dataVenda: Date;
  descricao?: string;
  valorPago: number;
  status: VendaStatus;
}

export interface ReceitaView {
  id: string;
  vendaId: string;
  clienteId: string;
  valor: number;
  dataPagamento: Date;
}
