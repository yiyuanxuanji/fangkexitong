# coding=utf-8
# 导入蓝图对象
from . import api
# 导入flask内置的对象
from flask import current_app, jsonify, g, request, session
from fangkexitong import db
# 导入自定义状态码
from fangkexitong.utils.response_code import RET
# 导入模型类
from fangkexitong.models import Invitation, InvitingPerson, PersonOpen, Visitors, Applicant, Users
# 导入json模块
import json, re
# 导入日期模块
import datetime
@api.route('/recepost/<int:id>', methods=['GET'])
def get_list_reception(id):
    """
        前台查询到访人员,根据时间
        :return:
        """
    if 1 == id:    # 邀请函的数据
        #  获取json中的数据
        info_data = request.get_json()
        data_come_time = info_data.get('come_time')
        data_leave_time = info_data.get('leave_time')
        # data = session.query(Invitation).filter(Invitation.visit_time.in_([data_come_time,data_leave_time]).all()
        datas = Invitation.query.filter(or_(Invitation.visit_time>=data_come_time and data_leave_time>= Invitation.visit_time),(Invitation.leave_data>=data_come_time and data_leave_time>= Invitation.leave_data)).all()
        info = []
        for data in datas:
            data.inviting_object()
            info.append(data)
        return jsonify (success=RET.OK, data=info)

    else:
        info_data = request.get_json()
        data_come_time = info_data.get('come_time')
        data_leave_time = info_data.get('leave_time2')
        # data = session.query(Invitation).filter(Invitation.visit_time.in_([data_come_time,data_leave_time]).all()
        datas = Applicant.query.filter(or_(Applicant.visit_time >= data_come_time and data_leave_time >= Applicant.visit_time),
            (Applicant.leave_data >= data_come_time and data_leave_time >= Applicant.leave_data)).all()
        info = []
        for data in datas:
            data.inviting_object()
            info.append(data)
        return jsonify(success=RET.OK, data=info)

@api.route('/recepost/invit', methods=['GET'])
def get_reception_info():
    """
        前台查询到访人员,查询邀请函的具体信息
        :return:
        """
    info_data = request.get_json()
    invite_id = info_data.get('invite_id')
    user_id = info_data.get('user_id')

    try:
        # user_id = g.user_id
        # user_name = g.user_name
        # user_phone = g.user_phone
        invitation = Invitation.query.filter_by(id=invite_id).first()
        user = Users.query.filter_by(id=user_id).first()
    except Exception as e:
        current_app.logger.error(e)
        return jsonify(success=RET.DBERR, data='查询数据异常')
    data = invitation.inviting_infomation()
    data["user_name"] = user.full_name
    data["user_phone"] = user.phone
    # data["time"] = datetime.datetime.now().strftime('%Y-%m-%d')
    return jsonify(success=RET.OK, data=data)      # 未完待续