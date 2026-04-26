import PocketBase from 'pocketbase'

let _pb: PocketBase | null = null

export function getClient(): PocketBase {
  if (!_pb) {
    _pb = new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL)
    _pb.autoCancellation(false)
  }
  return _pb
}
