export type IQueryEventValues = {
  query: Record<string, string | null>
}

export type IQueryEvent = CustomEvent<IQueryEventValues>
