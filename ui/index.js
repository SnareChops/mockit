import { Socket } from './socket.js'
import { loadRegistered } from './registered.js'
import { loadRequests } from './requests.js'

async function main() {
  const socket = new Socket()
  loadRegistered()
  loadRequests()
}

main()
