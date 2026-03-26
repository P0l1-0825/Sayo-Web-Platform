import { api, isDemoMode } from "./api-client"
import type { Card, CardSensitiveData, CardToken, CardShipment, CardBlock, Chargeback, TravelNotice } from "./types"

// ============================================================
// SAYO — Card Service (Pomelo-backed)
// Calls the card-service via gateway at /api/v1/cards/
// Falls back to demo data when isDemoMode is true.
// ============================================================

const CARD_API = "/api/v1/cards"

// --- Demo Data ---

const demoCards: Card[] = [
  {
    id: "card-001",
    user_id: "demo-user",
    type: "virtual",
    brand: "VISA",
    status: "active",
    card_number_masked: "**** **** **** 4321",
    holder_name: "Sofía Hernández",
    expiry_date: "12/27",
    balance: 0,
    credit_limit: 50000,
    is_virtual: true,
    created_at: "2024-01-15T10:00:00Z",
  },
  {
    id: "card-002",
    user_id: "demo-user",
    type: "physical",
    brand: "MASTERCARD",
    status: "active",
    card_number_masked: "**** **** **** 8876",
    holder_name: "Sofía Hernández",
    expiry_date: "06/28",
    balance: 0,
    credit_limit: 100000,
    is_virtual: false,
    created_at: "2024-02-01T10:00:00Z",
  },
  {
    id: "card-003",
    user_id: "demo-user",
    type: "physical",
    brand: "VISA",
    status: "pending_activation",
    card_number_masked: "**** **** **** 2255",
    holder_name: "Sofía Hernández",
    expiry_date: "09/29",
    balance: 0,
    credit_limit: 75000,
    is_virtual: false,
    created_at: "2025-01-10T10:00:00Z",
  },
]

// NOTE: Full PANs and CVVs are never stored in the frontend.
// In demo mode, masked values are shown; real sensitive data is only
// returned by the backend through an authenticated, time-limited endpoint.
const demoSensitiveData: Record<string, CardSensitiveData> = {
  "card-001": { pan: "**** **** **** 4321", cvv: "***", expiry_month: "12", expiry_year: "27" },
  "card-002": { pan: "**** **** **** 8876", cvv: "***", expiry_month: "06", expiry_year: "28" },
  "card-003": { pan: "**** **** **** 2255", cvv: "***", expiry_month: "09", expiry_year: "29" },
}

const demoTokens: Record<string, CardToken[]> = {
  "card-001": [
    { id: "tok-001", provider: "apple_pay", status: "active", last_four: "4321" },
    { id: "tok-002", provider: "google_pay", status: "suspended", last_four: "4321" },
  ],
  "card-002": [
    { id: "tok-003", provider: "apple_pay", status: "active", last_four: "8876" },
  ],
  "card-003": [],
}

const demoShipments: Record<string, CardShipment> = {
  "card-002": {
    status: "delivered",
    carrier: "DHL",
    tracking_number: "DHL1234567890MX",
    estimated_delivery: "2024-02-05",
  },
  "card-003": {
    status: "in_transit",
    carrier: "FedEx",
    tracking_number: "FEDEX9876543210",
    estimated_delivery: "2025-01-20",
  },
}

const demoBlocks: Record<string, CardBlock[]> = {
  "card-001": [
    { id: "blk-001", card_id: "card-001", block_type: "country", value: "KP", created_at: "2024-03-01T00:00:00Z" },
  ],
  "card-002": [],
  "card-003": [],
}

const demoChargebacks: Chargeback[] = []

// --- Admin Demo Data (all users) ---

export const demoAllCards: Card[] = [
  ...demoCards,
  {
    id: "card-004",
    user_id: "user-002",
    type: "virtual",
    brand: "VISA",
    status: "blocked",
    card_number_masked: "**** **** **** 1122",
    holder_name: "Carlos Mendoza",
    expiry_date: "03/27",
    balance: 0,
    credit_limit: 30000,
    is_virtual: true,
    created_at: "2024-03-10T10:00:00Z",
  },
  {
    id: "card-005",
    user_id: "user-003",
    type: "physical",
    brand: "MASTERCARD",
    status: "active",
    card_number_masked: "**** **** **** 9988",
    holder_name: "Ana García",
    expiry_date: "11/28",
    balance: 0,
    credit_limit: 200000,
    is_virtual: false,
    created_at: "2024-04-01T10:00:00Z",
  },
  {
    id: "card-006",
    user_id: "user-004",
    type: "virtual",
    brand: "VISA",
    status: "expired",
    card_number_masked: "**** **** **** 3344",
    holder_name: "Roberto López",
    expiry_date: "01/25",
    balance: 0,
    credit_limit: 15000,
    is_virtual: true,
    created_at: "2023-01-15T10:00:00Z",
  },
]

// --- Service ---

export const cardService = {
  async fetchCards(): Promise<Card[]> {
    if (isDemoMode) return demoCards
    return api.get<Card[]>(CARD_API)
  },

  async fetchAllCards(): Promise<Card[]> {
    if (isDemoMode) return demoAllCards
    return api.get<Card[]>(`${CARD_API}/admin/all`)
  },

  async createCard(type: "virtual" | "physical", nameOnCard: string): Promise<Card> {
    if (isDemoMode) {
      const newCard: Card = {
        id: `card-${Date.now()}`,
        user_id: "demo-user",
        type,
        brand: "VISA",
        status: type === "virtual" ? "active" : "pending_activation",
        card_number_masked: `**** **** **** ${Math.floor(1000 + Math.random() * 9000)}`,
        holder_name: nameOnCard,
        expiry_date: "12/28",
        balance: 0,
        credit_limit: 50000,
        is_virtual: type === "virtual",
        created_at: new Date().toISOString(),
      }
      demoCards.push(newCard)
      return newCard
    }
    return api.post<Card>(CARD_API, {
      card_type: type.toUpperCase(),
      name_on_card: nameOnCard || undefined,
    })
  },

  async activateCard(cardId: string, pin: string): Promise<{ success: boolean }> {
    if (isDemoMode) {
      const card = demoCards.find((c) => c.id === cardId)
      if (card) card.status = "active"
      return { success: true }
    }
    return api.post<{ success: boolean }>(`${CARD_API}/${cardId}/activate`, { pin })
  },

  async blockCard(cardId: string, reason: string): Promise<{ success: boolean }> {
    if (isDemoMode) {
      const card = demoCards.find((c) => c.id === cardId)
      if (card) card.status = "blocked"
      return { success: true }
    }
    return api.post<{ success: boolean }>(`${CARD_API}/${cardId}/block`, { reason })
  },

  async unblockCard(cardId: string): Promise<{ success: boolean }> {
    if (isDemoMode) {
      const card = demoCards.find((c) => c.id === cardId)
      if (card) card.status = "active"
      return { success: true }
    }
    return api.post<{ success: boolean }>(`${CARD_API}/${cardId}/unblock`, {})
  },

  async refreshCvv(cardId: string): Promise<CardSensitiveData> {
    if (isDemoMode) {
      // CVVs are never revealed in demo mode — backend validation is required.
      return demoSensitiveData[cardId] ?? { pan: "**** **** **** ****", cvv: "***", expiry_month: "12", expiry_year: "28" }
    }
    return api.post<CardSensitiveData>(`${CARD_API}/cvv/refresh`, { card_id: cardId })
  },

  async getSensitiveData(cardId: string): Promise<CardSensitiveData> {
    if (isDemoMode) {
      return (
        demoSensitiveData[cardId] ?? {
          pan: "**** **** **** ****",
          cvv: "***",
          expiry_month: "12",
          expiry_year: "28",
        }
      )
    }
    return api.get<CardSensitiveData>(`${CARD_API}/sensitive/${cardId}`)
  },

  async getTokens(cardId: string): Promise<CardToken[]> {
    if (isDemoMode) return demoTokens[cardId] ?? []
    return api.get<CardToken[]>(`${CARD_API}/tokens/${cardId}`)
  },

  async suspendToken(tokenId: string): Promise<{ success: boolean }> {
    if (isDemoMode) return { success: true }
    return api.post<{ success: boolean }>(`${CARD_API}/tokens/${tokenId}/suspend`, {})
  },

  async reactivateToken(tokenId: string): Promise<{ success: boolean }> {
    if (isDemoMode) return { success: true }
    return api.post<{ success: boolean }>(`${CARD_API}/tokens/${tokenId}/reactivate`, {})
  },

  async getShipment(cardId: string): Promise<CardShipment | null> {
    if (isDemoMode) return demoShipments[cardId] ?? null
    return api.get<CardShipment | null>(`${CARD_API}/shipments/${cardId}`)
  },

  async getBlocks(cardId: string): Promise<CardBlock[]> {
    if (isDemoMode) return demoBlocks[cardId] ?? []
    return api.get<CardBlock[]>(`${CARD_API}/blocks/${cardId}`)
  },

  async createBlock(cardId: string, blockType: CardBlock["block_type"], value: string): Promise<CardBlock> {
    if (isDemoMode) {
      const newBlock: CardBlock = {
        id: `blk-${Date.now()}`,
        card_id: cardId,
        block_type: blockType,
        value,
        created_at: new Date().toISOString(),
      }
      if (!demoBlocks[cardId]) demoBlocks[cardId] = []
      demoBlocks[cardId].push(newBlock)
      return newBlock
    }
    return api.post<CardBlock>(`${CARD_API}/blocks`, { card_id: cardId, block_type: blockType, value })
  },

  async deleteBlock(blockId: string): Promise<{ success: boolean }> {
    if (isDemoMode) {
      for (const cardId in demoBlocks) {
        const idx = demoBlocks[cardId].findIndex((b) => b.id === blockId)
        if (idx !== -1) {
          demoBlocks[cardId].splice(idx, 1)
          break
        }
      }
      return { success: true }
    }
    return api.delete<{ success: boolean }>(`${CARD_API}/blocks/${blockId}`)
  },

  async createChargeback(
    cardId: string,
    txId: string,
    reason: string,
    amount: number
  ): Promise<Chargeback> {
    if (isDemoMode) {
      const cb: Chargeback = {
        id: `cb-${Date.now()}`,
        card_id: cardId,
        transaction_id: txId,
        reason,
        amount,
        status: "pending",
        created_at: new Date().toISOString(),
      }
      demoChargebacks.push(cb)
      return cb
    }
    return api.post<Chargeback>(`${CARD_API}/chargebacks`, {
      card_id: cardId,
      transaction_id: txId,
      reason,
      amount,
    })
  },

  async getChargeback(chargebackId: string): Promise<Chargeback | null> {
    if (isDemoMode) return demoChargebacks.find((c) => c.id === chargebackId) ?? null
    return api.get<Chargeback>(`${CARD_API}/chargebacks/${chargebackId}`)
  },

  async createTravelNotice(
    userId: string,
    countries: string[],
    startDate: string,
    endDate: string
  ): Promise<TravelNotice> {
    if (isDemoMode) {
      return {
        id: `tn-${Date.now()}`,
        user_id: userId,
        countries,
        start_date: startDate,
        end_date: endDate,
        status: "active",
      }
    }
    return api.post<TravelNotice>(`${CARD_API}/travel-notices`, {
      user_id: userId,
      countries,
      start_date: startDate,
      end_date: endDate,
    })
  },
}
