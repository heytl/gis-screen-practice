
export default {
    download: (data, fileName, responseType = 'application/octet-stream') => {
        const blob = data instanceof Blob ? data : new Blob([data], { type: responseType })
        if ('download' in document.createElement('a')) { // 非IE下载
            const url = window.URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.style.display = 'none'
            link.href = url
            link.setAttribute('download', fileName)
            document.body.appendChild(link)
            link.click()
            window.URL.revokeObjectURL(link.href)
            document.body.removeChild(link)
        } else { // IE10+下载
            navigator.msSaveBlob(blob, fileName)
        }
    }
}
