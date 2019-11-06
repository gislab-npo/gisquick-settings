
export default function WebsocketMessenger (url) {
  let listeners = []
  let openListeners = []
  const activeRequests = {}
  const socket = new WebSocket(url)
  let timer = null
  const ws = {
    connected: false,
    pluginConnected: false,

    bind (type, callback) {
      listeners.push({ type, callback })
      return callback
    },
    unbind (type, callback) {
      listeners = listeners.filter(l => l.type !== type || l.callback !== callback)
    },
    send (name, data) {
      const msg = { type: name, data }
      socket.send(JSON.stringify(msg))
    },
    request (name, data) {
      return new Promise((resolve, reject) => {
        activeRequests[name] = { resolve, reject }
        this.send(name, data)
      })
    },
    close () {
      if (timer !== null) {
        clearInterval(timer)
        timer = null
      }
      socket.close()
    },
    onopen () {
      return new Promise(resolve => {
        if (ws.connected) {
          resolve()
        } else {
          openListeners.push(resolve)
        }
      })
    }
  }

  socket.onopen = () => {
    ws.connected = true
    openListeners.forEach(cb => cb())
    openListeners = []
    ws.send('PluginStatus')
  }
  socket.onclose = () => {
    ws.connected = false
  }
  socket.onmessage = (e) => {
    const msg = JSON.parse(e.data)
    if (msg.type === 'PluginStatus') {
      ws.pluginConnected = msg.data === 'Connected'
    }

    if (activeRequests[msg.type]) {
      if (msg.status === 'error') {
        activeRequests[msg.type].reject(msg)
      } else {
        activeRequests[msg.type].resolve(msg)
      }
      delete activeRequests[msg.type]
    }
    listeners.filter(l => l.type === msg.type).forEach(l => l.callback(msg))
  }
  timer = setInterval(() => {
    socket.send('Ping')
  }, 30 * 1000)
  return ws
}
