import request from '@/utils/request'

export function add(data) {
  return request({
    url: 'api/reimbursementDetail',
    method: 'post',
    data
  })
}

export function del(id) {
  return request({
    url: 'api/reimbursementDetail/' + id,
    method: 'delete'
  })
}

export function edit(data) {
  return request({
    url: 'api/reimbursementDetail',
    method: 'put',
    data
  })
}
