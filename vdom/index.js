/*
* @Author: dangxiaoli
* @Date:   2018-03-29 11:21:49
* @Last Modified by:   dangxiaoli
* @Last Modified time: 2018-03-29 15:53:33
*/
//--------------------------用JS对象模拟DOM树--------------------------
function Element (tagName, props, children) {
  this.tagName = tagName
  this.props = props
  this.children = children
}

//构建真正的<ul>
Element.prototype.render = function () {
  var el = document.createElement(this.tagName) // 根据tagName构建
  var props = this.props

  for (var propName in props) { // 设置节点的DOM属性
    var propValue = props[propName]
    el.setAttribute(propName, propValue)
  }

  var children = this.children || []

  children.forEach(function (child) {
    var childEl = (child instanceof Element)
      ? child.render() // 如果子节点也是虚拟DOM，递归构建DOM节点
      : document.createTextNode(child) // 如果字符串，只构建文本节点
    el.appendChild(childEl)
  })

  return el
}

const ele = function (tagName, props, children) {
  return new Element(tagName, props, children)
}



var ul = ele('ul', {id: 'list'}, [
  ele('li', {class: 'item'}, ['Item 1']),
  ele('li', {class: 'item'}, ['Item 2']),
  ele('li', {class: 'item'}, ['Item 3'])
])


var ulRoot = ul.render()
document.body.appendChild(ulRoot)





//-----------------------------diff--------------------------
// diff 函数，对比两棵树
function diff (oldTree, newTree) {
  var index = 0 // 当前节点的标志
  var patches = {} // 用来记录每个节点差异的对象
  dfsWalk(oldTree, newTree, index, patches)
  return patches
}

// 对两棵树进行深度优先遍历
function dfsWalk (oldNode, newNode, index, patches) {
  // 对比oldNode和newNode的不同，记录下来
  patches[index] = [...]

  diffChildren(oldNode.children, newNode.children, index, patches)
}

// 遍历子节点
function diffChildren (oldChildren, newChildren, index, patches) {
  var leftNode = null
  var currentNodeIndex = index
  oldChildren.forEach(function (child, i) {
    var newChild = newChildren[i]
    currentNodeIndex = (leftNode && leftNode.count) // 计算节点的标识
      ? currentNodeIndex + leftNode.count + 1
      : currentNodeIndex + 1
    dfsWalk(child, newChild, currentNodeIndex, patches) // 深度遍历子节点
    leftNode = child
  })
}

/**
 * 例如，上面的div和新的div有差异，当前的标记是0，那么：

    patches[0] = [{difference}, {difference}, ...] // 用数组存储新旧节点的不同
    同理p是patches[1]，ul是patches[3]，类推。
 */

//-----------------------定义了几种差异类型-----------------------
var REPLACE = 0
var REORDER = 1
var PROPS = 2
var TEXT = 3

//对于节点替换，判断新旧节点的tagName和是不是一样的，如果不一样的说明需要替换掉。如div换成section，就记录下：
patches[0] = [{
  type: REPALCE,
  node: newNode // el('section', props, children)
}]

//如果给div新增了属性id为container，就记录下
patches[0] = [{
  type: REPALCE,
  node: newNode // el('section', props, children)
}, {
  type: PROPS,
  props: {
    id: "container"
  }
}]

//如果是文本节点，如上面的文本节点2，就记录下
patches[2] = [{
  type: TEXT,
  content: "Virtual DOM2"
}]
