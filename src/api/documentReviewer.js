import request from '@/utils/request'

export function add(data) {
  return request({
    url: 'api/documentReviewer',
    method: 'post',
    data
  })
}

export function del(id) {
  return request({
    url: 'api/documentReviewer/' + id,
    method: 'delete'
  })
}

export function edit(data) {
  return request({
    url: 'api/documentReviewer',
    method: 'put',
    data
  })
}

// 查询所有单据（申请和报销）
export function getAllDocuments(params) {
  return request({
    url: 'api/documentReviewer/allDocuments',
    method: 'get',
    params
  })
}

// 查询所有禁用审批等级
export function getDisableSorted(params) {
  return request({
    url: 'api/documentReviewer/allDisableSorted',
    method: 'get',
    params
  })
}
