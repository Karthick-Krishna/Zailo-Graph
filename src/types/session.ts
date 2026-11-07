import { ImageItem } from './image';

export interface PipelineNode {
  nodeId: string;
  parentId?: string;
  utilityId: string;
  utilityName: string;
  timestamp: number;
  params: Record<string, any>;
  resultBlob: Blob;
  resultSize: number;
  resultWidth: number;
  resultHeight: number;
}

export interface SessionDAG {
  nodes: Record<string, PipelineNode>;
  history: string[]; // Node IDs in chronological order
}

export interface WorkspaceSession {
  images: ImageItem[];
  activeImageId: string | null;
  activeUtilityId: string;
  isProcessingBatch: boolean;
  totalBatchProgress: number;
  estimatedMemoryBytes: number;
}

