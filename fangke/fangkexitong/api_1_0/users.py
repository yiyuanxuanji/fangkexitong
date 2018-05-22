# coding=utf-8
# 导入蓝图对象
from . import api
# 导入flask内置的对象
from flask import current_app, jsonify, g, request
from fangkexitong import db
# 导入自定义状态码
from fangkexitong.utils.response_code import RET
# 导入模型类
from fangkexitong.models import Invitation, Users, Applicant
# 导入json模块
import json, re
# 导入日期模块
import datetime
import os


@api.route('/users/login', methods=['POST'])
def login():
    """
    用户登陆

    """
    # 获取参数
    user_data = request.get_json()
    # 检查参数存在
    if not user_data:
        return jsonify(success=RET.WRONG, data='参数缺失!')
    # 获取详细的参数信息
    username = user_data.get('username')
    password = user_data.get('password')
    # 检查参数的完整性
    if not all([username, password]):
        return jsonify(success=RET.WRONG, data='参数缺失!')
    # 查询数据库
    try:
        user = Users.query.filter_by(username=username).first()  # 这个库不再我这可能有问题  # 用户名
    except Exception as e:
        current_app.logger.error(e)
        return jsonify(success=RET.WRONG, data='账号密码不正确!')
    # 判断查询结果,对密码进行检查
    if user is None or not user.check_password(password):
        return jsonify(success=RET.WRONG, data='账号密码不正确!')
    # 缓存用户信息
    # g.user_id = user.id
    # g.user_name = user.username
    # g.user_phone = user.phone

    # 返回结果
    return jsonify(success=RET.OK, data={"user_id": user.username})


@api.route('/users/invite', methods=['POST'])
def get_invite():
    """
    邀请函生成,
    :return:
    """
    # 获取post请求的json字符串
    invite_data = request.get_json()
    # 检查参数的存在
    if not invite_data:
        return jsonify(jsonify(success=RET.WRONG, data='参数缺失'))
    # 获取详细的参数信息
    user_id = invite_data.get('user_id')   # 用户名
    full_name = invite_data.get('full_name')
    phone = invite_data.get('phone')
    visitor_count = invite_data.get('visitor_count')
    visit_time = invite_data.get('visit_time')
    # leaver_data = invite_data.get('leaver_data')
    position = invite_data.get('position')
    reason = invite_data.get('reason')
    # image_url = invite_data.get('image_url')
    check_in = invite_data.get("check_in")
    # 检查参数的完整性
    if not all([full_name, phone, visitor_count,visit_time, position, reason]):  # 此处没有写图片,图片可以为空
        return jsonify(jsonify(success=RET.WRONG, data='数据不完整'))
    # 保存用户实名信息到sqlserver数据库中
    # 构造模型类对象,准备保存用户信息
    invitation = Invitation()
    invitation.full_name = full_name
    invitation.phone = phone
    invitation.visitor_count = visitor_count
    invitation.visit_time = visit_time
    invitation.position = position
    invitation.reason = reason
    invitation.check_in = check_in
    invitation.user_id = user_id
    invitation.state = "待接受"
    # 提交数据到数据库中
    try:
        db.session.add(invitation)
        db.session.commit()
        # g.invit_id = invitation.id
    except Exception as e:
        current_app.logger.error(e)
        # 写入如果发生异常,需要进行回滚
        db.session.rollback()
        return jsonify(success=RET.WRONG, data='保存用户信息失败')

    # 返回结果
    return jsonify(success=RET.OK, data={"invit_id": invitation.id,  # 该请柬id
                                         "auth_code": invitation.inviting_infomation()})

    # invit = Invitation.query(Invitation.inviting_object()).filter_by(user_id=user_id)
    # applicant = Applicant.query(Applicant.inviting_object()).filter_by(user_id=user_id)
    #
    # invit.union(applicant).all().order_by(visit_time)


@api.route('/users/search/<int:sal>', methods=['GET'])
def list_visitor(sal):
    """
    访客邀请列表
    :return:
    """
    info_data = request.get_json()
    page = request.args.get("page", "1")
    if not info_data:
        return jsonify(jsonify(success=RET.WRONG, data='参数缺失'))
    try:
        user_id = info_data.get('user_id')   # 获取发邀人的用户名
        rs_dict_list = []
        if 1 == sal:
            # 通过id查询的邀请函表
            invit = Invitation.query.filter_by(user_id=user_id).order_by(Invitation.update_time.desc()).all()
            # 分页
            rs_page = invit.paginate(page, 20, False)
            #  获取分页后的数据
            rs_list = rs_page.items
            #  获取一共多少页
            total_page = rs_page.pages
            # 定义容器,容器内字典
            for row in rs_list:
                rs_dict_list.append(row.invit_object())
        else:
            #  通过id查询的申请人的表
            applicant = Applicant.query.filter_by(user_id=user_id).order_by(Invitation.update_time.desc()).all()
            rs_page = applicant.paginate(page, 20, False)
            #  获取分页后的数据
            rs_list = rs_page.items
            #  获取一共多少页
            total_page = rs_page.pages
            # 定义容器,容器内字典
            for row in rs_list:
                rs_dict_list.append(row.invit_object())
        return jsonify(success=RET.OK, data=rs_dict_list, total_page=total_page)
    except Exception as e:
        current_app.logger.error(e)
        return jsonify(success=RET.DBERR, data='查询数据异常')

# @api.route('/users/search', methods=['GET'])
# def list_visitor():
#     """
#     访客邀请列表
#     :return:
#     """
#
#     # page = request.args.get('p', '1')
#     info_data = request.get_json()
#     page = info_data.get('p')
#     page = int(page)
#     if not info_data:
#         return jsonify(jsonify(success=RET.WRONG, data='参数缺失'))
#     try:
#         user_id = info_data.get('user_id')   #  获取发邀人的id
#         from sqlalchemy import create_engine
#         from config import SQLALCHEMY_DATABASE_URI
#         # 连接数据库
#         engine = create_engine(SQLALCHEMY_DATABASE_URI, echo=True)
#         # 使用with语句连接数据库，如果发生异常会被捕获
#         with engine.connect() as con:
#             # 执行查询操作
#             sql = """
#                 select full_name,visit_time,state,update_time from fk_invitation where user_id=%s
#                 union all select full_name,visit_time,state,update_time from fk_invitation where user_id=%s
#                 order by visit_time desc
#             """  %(user_id, user_id)
#             rs = con.execute(sql).fetchall()
#             # 对排序后的数据进行分页,page代表页数,每页的条目数,False分页异常不报错
#         rs_page = rs.paginate(page, 10, False)
#         #  获取分页后的数据
#         rs_list = rs_page.items
#         #  获取一共多少页
#         total_page = rs_page.pages
#         # 定义容器,容器内字典
#         rs_dict_list = []
#         for row in rs_list:
#             a = {"full_name": row["full_name"],
#                  "visit_time": row["visit_time"],
#                  "state": row["state"]}
#             rs_dict_list.append(a)
#     except Exception as e:
#         current_app.logger.error(e)
#         return jsonify(success=RET.DBERR, data='查询数据异常')
#     resp = {"success": 1, "data": rs_dict_list}
#     # 序列化数据,转成json
#     resp_json = json.dumps(resp)
#     if page <= total_page:
#         return resp_json


@api.route('/users/invite', methods=['GET'])
def list_invite():
    """
    访客邀请展示
    :return:
    """
    info_data = request.get_json()
    invite_id = info_data.get('invit_id')
    user_id = info_data.get('user_id')

    try:
        # user_id = g.user_id
        # user_name = g.user_name
        # user_phone = g.user_phone
        invitation = Invitation.query.filter_by(id=invite_id).first()
        user = Users.query.filter_by(username=user_id).first()
    except Exception as e:
        current_app.logger.error(e)
        return jsonify(success=RET.DBERR, data='查询数据异常')
    data = invitation.inviting_infomation()
    data["user_name"] = user.full_name
    data["user_phone"] = user.phone
    data["time"] = datetime.datetime.now().strftime('%Y-%m-%d')
    return jsonify(success=RET.OK, data=data)


@api.route('/users/push', methods=['POST'])
def post_image():
    """
    上传图片
    :return:
    """
    #  获取json中的数据
    info_data = request.get_json()
    invite_id = info_data.get('invite_id')
    user_id = info_data.get('user_id')
    #  获取请求中的文件数据
    f = request.files['file']
    filename = invite_id+user_id + ".jpg"
    f.save(os.path.join('fangkexitong/invite', filename))
    # f.save('app/static/' + str(filename))
    url = "fangkexitong/invite" + filename
    return jsonify(success=RET.OK, data=url)


@api.route('/users/pull', methods=['GET'])
def poll_image():
    """
    下载图片
    :return:
    """
    #  获取json中的数据
    info_data = request.get_json()
    invite_id = info_data.get('invite_id')
    invit = Invitation.query.filter_by(id=invite_id).first()
    url = invit.image_url
    return jsonify(success=RET.OK, data=url)