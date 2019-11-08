import request from '@/utils/request'

export function add(data) {
  return request({
    url: 'api/applicationDocuments',
    method: 'post',
    data
  })
}

export function del(id) {
  return request({
    url: 'api/applicationDocuments/' + id,
    method: 'delete'
  })
}

export function edit(data) {
  return request({
    url: 'api/applicationDocuments',
    method: 'put',
    data
  })
}


export function toQuery() {
  return request({
    url: 'api/applicationDocumentsPost',
    method: 'post',

    data
  })

}
