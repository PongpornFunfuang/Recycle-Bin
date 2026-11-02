export type PinSaveAttempt={id:string;values:unknown};
// Retry only the exact immutable payload. Editing a failed draft starts a new event.
export function preparePinSaveAttempt(previous:PinSaveAttempt|null,values:unknown):PinSaveAttempt{
  return previous&&JSON.stringify(previous.values)===JSON.stringify(values)
    ?previous:{id:crypto.randomUUID(),values:structuredClone(values)};
}
