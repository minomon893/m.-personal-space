/**
 * 日々ンゴのデータ型定義
 */

export type BingoType = 'official' | 'custom';

export interface Bingo {
  id: string;
  title: string;
  type: BingoType;
  /** 9マスのテキストを格納。中央(index 4)は「日々ンゴを見る」固定 */
  grid: string[];
  created_at: string;
  updated_at: string;
  user_id?: string;
}

export interface BingoProgress {
  id: string;
  bingo_id: string;
  user_id: string;
  /** 9マスのチェック状態をboolean配列で管理 */
  checked: boolean[];
  updated_at: string;
}

export interface Favorite {
  id: string;
  user_id: string;
  /** お気に入りテキスト（パレット表示用） */
  text: string;
  /** カテゴリ識別用（hibingo等） */
  category?: string;
  created_at: string;
}

export interface BingoLock {
  id: string;
  user_id: string;
  /** ロック解除される日時 */
  locked_until: string;
  created_at: string;
}

/**
 * ビンゴ判定用のユーティリティ型
 */
export type BingoGridIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

/**
 * 作成時・更新時のペイロード型
 */
export type CreateBingoInput = Omit<Bingo, 'id' | 'created_at' | 'updated_at'>;