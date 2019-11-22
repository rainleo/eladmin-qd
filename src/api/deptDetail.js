import request from '@/utils/request'

export function add(data) {
  return request({
    url: 'api/deptDetail',
    method: 'post',
    data
  })
}

export function del(id) {
  return request({
    url: 'api/deptDetail/' + id,
    method: 'delete'
  })
}

export function edit(data) {
  return request({
    url: 'api/deptDetail',
    method: 'put',
    data
  })
}
