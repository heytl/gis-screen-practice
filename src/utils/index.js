export default {
  download: (data, fileName, responseType = 'application/octet-stream') => {
    const blob = data instanceof Blob ? data : new Blob([data], { type: responseType })
    if ('download' in document.createElement('a')) {
      // 非IE下载
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.style.display = 'none'
      link.href = url
      link.setAttribute('download', fileName)
      document.body.appendChild(link)
      link.click()
      window.URL.revokeObjectURL(link.href)
      document.body.removeChild(link)
    } else {
      // IE10+下载
      navigator.msSaveBlob(blob, fileName)
    }
  },
  upload: (fileType = '.json', callback) => {
    // 创建动态输入框
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = fileType // 限制选择 JSON 文件
    input.style.display = 'none'

    // 绑定 change 事件处理程序
    input.addEventListener('change', callback)

    // 触发点击事件打开文件选择对话框
    input.click()
  }
}
