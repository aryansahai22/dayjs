export default (o, c) => {
  const proto = c.prototype
  proto.isWeekend = function () {
    return this.$W === 0 || this.$W === 6
  }
}
