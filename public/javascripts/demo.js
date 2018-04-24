/*将默认提示中文化start*/
jQuery.extend(jQuery.validator.messages, {
    required   : "必选字段",
	remote     : "请修正该字段",
	email      : "请输入正确格式的电子邮件",
	url        : "请输入合法的网址",
	date       : "请输入合法的日期",
	dateISO    : "请输入合法的日期 (ISO).",
	number     : "请输入合法的数字",
	digits     : "只能输入整数",
	creditcard : "请输入合法的信用卡号",
	equalTo    : "请再次输入相同的值",
	accept     : "请输入拥有合法后缀名的字符串",
	maxlength  : jQuery.validator.format("请输入一个长度最多是{0}的字符串"),
	minlength  : jQuery.validator.format("请输入一个长度最少是{0}的字符串"),
	rangelength: jQuery.validator.format("请输入一个长度介于{0}和{1}之间的字符串"),
	range      : jQuery.validator.format("请输入一个介于{0}和{1}之间的值"),
	max        : jQuery.validator.format("请输入一个最大为{0}的值"),
	min        : jQuery.validator.format("请输入一个最小为{0}的值")
});
/*将默认提示中文化end*/

/*验证demo表单start*/
$(function(){
	jQuery.validator.addMethod('mobile',function(value,element){
		var telmatch = /^1[0-9]{10}$/;
		return this.optional(element) || (telmatch.test(value));
	},'请输入正确的手机号码');

	$('#demo').validate({
		errorElement: 'span',
		errorClass: 'false',
		validClass: 'right',
		onfocusout: function(element){
	        $(element).valid();
	    },
		errorPlacement: function(error,element){
			element.next().append(error);
		},
		highlight: function(element, errorClass, validClass) {
			$(element).removeClass('right').addClass('false');
			$(element).next().removeClass('right').addClass('false');
        },
        success: function(span){
			span.removeClass('false').addClass('right');
		},
		rules: {
			username: {
				required: true
			},
			password: {
				required: true,
				minlength: 8,
				maxlength: 16
			},
			password2: {
				required: true,
				equalTo: '#password',
				minlength: 8,
				maxlength: 16
			},
            mobile: {
				required: true,
				minlength: 11,
				maxlength: 11,
				digits: true
			},
            gender: {
				required: true
			},
			favorite: {
				required: true,
				minlength: 2
			},
            description:{
                required: true,
                minlength: 0,
                maxlength: 20
			}
		},
        submitHandler: function(form) {  //通过之后回调
            var param = $("#demo").serialize();
            $.ajax({
                url : "/vote/register/data",
                type : "post",
                data: param,
                success : function(result) {
                    var result=JSON.parse(result)
                    var notice=`<div class="sub_title">
						<p>${result.msg}</p>
					</div>`
                    $(".mask .no_signed").html(notice)
                    $(".mask").show();
                    window.setTimeout(function () {
                        window.location.href="http://localhost:8080/vote/index"
                    },3000)


                }
            });
        },
        invalidHandler: function(form, validator) {  //不通过回调
            return false;
        },
		messages: {
			username: {
				required: '请设置一个用户名'
			},
			password: {
				required: '请设置一个密码',
				minlength: '密码长度不小于8个字符',
				maxlength: '密码长度不大于16个字符'
			},
			password2: {
				required: '请再次确认密码',
				equalTo: '两次输入密码不相同',
				minlength: '密码长度不小于8个字符',
				maxlength: '密码长度不大于16个字符'
			},
            mobile: {
				required: '请输入您的常用手机号码',
				minlength: '手机号码长度为11位',
				maxlength: '手机号码长度为11位',
				digits: '手机号码只能输入数字'
			},
            gender: {
				required: '请选择您的性别'
			},
			favorite: {
				required: '请选择您的爱好',
				minlength: '请至少选择两项'
			},
            description:{
                required: '请填写自我描述',
                minlength: '自我描述长度不小于0个字符',
                maxlength: '自我描述长度不大于20个字符'
			}
		}
	});	
})
/*验证demo表单end*/