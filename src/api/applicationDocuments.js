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
export function getUserName(params) {
  return request({
    url: 'api/users',
    method: 'get',
    params
  })
}
export function getDeptName(params) {
  return request({
    url: 'api/deptNormal',
    method: 'get',
    params
  })
}
