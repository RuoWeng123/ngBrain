export class EventEmitter {
  constructor() {
    this.events = {}
  }

  on(eventName, callBack) {
    if (!this.events[eventName]) {
      this.events[eventName] = []
    }

    this.events[eventName].push(callBack)

    return this
  }

  emit(eventName, ...args) {
    if (!this.events[eventName]) {
      return this
    }

    //从event中获取on中push的所有回调函数
    const fns = this.events[eventName]
    fns.forEach((fn) => fn.apply(this, args))

    return this
  }

  remove(eventName, callback) {
    if (!this.events[eventName]) {
      return this
    }
    // 没有回调函数，
    if (!callback) {
      this.events[eventName] = null
      return this
    }

    // 有回调函数，从现有的event中的队列中移出当前回调函数
    const index = this.events[eventName].indexOf(callback)
    this.events[eventName].splice(index, 1)

    return this
  }

  once(eventName, callBack) {
    const only = () => {
      callBack.apply(this, arguments)
      this.remove(eventName, only)
    }

    this.on(eventName, only)
    return this
  }
}
