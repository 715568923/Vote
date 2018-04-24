/**
 * Created by lenovo on 2017/4/20.
 */
let offset = 0;
let url = window.location.href;
const USER_KEY = 'USER_KEY';
const KEYWORD = 'KEYWORD';
let indexRegex = /\/vote\/index/;//首页的正则
let registerRegex = /\/vote\/register/;//报名页的正则
let searchReg = /\/vote\/search/;//搜索结果页的正则
let detailReg = /\/vote\/detail/;
//把比较长的代码，或者是通用可复用的代码放在此对象里
let voteFn = {
    formatUser(obj){
        return `<li>
                 <div class="head">
                 <a href="http://localhost:8080/vote/detail/${obj.id}"  target="_blank">
                 <img src="${obj.head_icon}" alt="">
                 </a>
                 </div>

                 <div class="up">
                 <div class="vote">
                 <span>${obj.vote_times}票</span>
                 </div>
                 <div class="btn" data-id="${obj.id}">
                 投TA一票
                 </div>
                 </div>
                 <div class="descr">
                 <a  href="http://localhost:8080/vote/detail/${obj.id}"  target="_blank" >
                 <div>
                 <span>${obj.username}</span>
                 <span>|</span>
                 <span>编号#${obj.id}</span>
                 </div>
                 <p>${obj.description}</p>
                 </a>
                 </div>
                 </li>`
    },//把一个用户对象转成li字符串
    request({url, type = 'GET', dataType = 'json', data, success}){
        $.ajax({
            url,
            type,
            dataType,
            data,
            success
        });
    },
    loadIndexData(){
        voteFn.request({
            url:'/vote/index/data?limit=10&offset='+offset,
            success:function (result) {
                offset += 10;
                let users = result.data.objects;
                var list='';
                for(var attr in users){
                    var obj=users[attr]
                    list+=voteFn.formatUser(obj)
                }
                $('.coming').html(list)


            }
        })//初次加载
        loadMore({
            callback(load){
                voteFn.request({
                    url:'/vote/index/data?limit=10&offset='+offset,
                    success(result){
                        let total = result.data.total;
                        if (offset >= total) {
                            load.complete();//让提示框显示数据加载完成
                            setTimeout(function () {
                                load.reset();//把提示框内容清除
                            }, 1000)
                        }else{
                            let users = result.data.objects;
                            var result='';
                            for(var attr in users){
                                var obj=users[attr]
                                result+=voteFn.formatUser(obj)
                            }
                            setTimeout(function () {
                                $('.coming').append(result);
                                load.reset();//把提示框内容清除
                            }, 1000);
                        }
                    }
                })
            }
        })//加载更多
    },
    bindVote(){
        $('.coming').click(function (event) {
            let $element = $(event.target);
            let user = voteFn.getUser();
            if(user){
                let voterId = user.id;//自己的ID，也就是投票者的ID
                let voteId = $element.data('id');
                voteFn.request({
                    url:`	/vote/index/poll?id=${voteId}&voterId=${voterId}`,
                    success(result){
                        if(result.errno  == 0){
                            let voteEle = $element.siblings('.vote').children('span');
                            voteEle.text(parseInt(voteEle.text())+1+'票');
                        }else{
                            alert(result.msg);
                        }
                    }
                })
            }else{
                alert('你尚未登录，请先登录');
                $('.mask').show();
            }
        });
    },
    initIndex(){//初始化首页代码
        voteFn.loadIndexData();//加载首页数据
        $('.sign_in').click(function () {
            $('.mask').show();
        });
        $('.mask').click(function(event){
            if($(event.target).hasClass('mask')){
                $(this).hide();
            }
        });
        $(".coming").on("click",".btn",function (event) {
            let $element = $(event.target);
            let user = voteFn.getUser();
            //console.log(user)
            if(user){
                let voterId = user.id;
                var id=$(event.target).data("id");
                voteFn.request({
                    url:`/vote/index/poll?id=${id}&voterId=${voterId}`,
                    success(result){
                        if(result.errno  == 0){
                            let voteEle=$element.siblings('.vote').children('span');
                            voteEle.text(parseInt(voteEle.text())+1+"票")
                        }else{
                            alert(result.msg)
                        }
                    }
                })
            }else {
                alert('你尚未登录，请先登录');
                $('.mask').show();
            }

        })
        voteFn.bindLogin();//处理登录按钮的点击事件
        voteFn.initLoginUser()//当用户已登录时，修改显示的内容

        $('.search span').click(function () {
            let keyword = $('.search input').val();
            localStorage.setItem(KEYWORD,keyword);
            location = `/vote/search`;
        })
    },
    initLoginUser(){
        let user = voteFn.getUser();
        if(user){
            $('.sign_in span').html('已登入');
            $('.register a').html('个人主页');
            $('.register a').attr('href',`/vote/detail/${user.id}`);
            $('.no_signed').hide();
            $('.username').html(user.username);
            $('.dropout').click(function () {
                voteFn.delUser();
                location.reload();
            });
        }
    },
    bindLogin(){
        $('.subbtn').click(function(){
            let id = $('.usernum').val();
            let password = $('.user_password').val();
            if(!(id &&password)){
                alert('用户名和密码都不能为空');
                return;
            }
            voteFn.request({
                url:'/vote/index/info',
                type:'POST',
                data:{id,password},
                success(result){
                    console.log(result)
                    if(result.errno == 0){
                        voteFn.setUser(result.user);
                        location.reload(true);
                    }else{
                        $('.subbtn').prev().append(`<div class="error">${result.msg}</div>`);
                        if($(".error").length>1){
                            $(".error").not(':first').remove()
                        }
                       // alert(result.msg);
                    }
                }
            })
        })
    },
    getUser(){//从storage中获取用户对象
        return localStorage.getItem(USER_KEY)?JSON.parse(localStorage.getItem(USER_KEY)):null
    },
    setUser(user){//向storage中写入用户对象
        localStorage.setItem(USER_KEY,JSON.stringify(user));
    },
    delUser(){//从storage清除
        localStorage.removeItem(USER_KEY);
    },
    initSearch(){
        let keyword = localStorage.getItem(KEYWORD);
        voteFn.request({
            url:`/vote/index/search?content=${keyword}`,
            success(result){
                let users = result.data;
                let html = users.map((user)=>{
                    return voteFn.formatUser(user);
                }).join('');
                $('.coming').html(html);
                voteFn.bindVote();
            }
        })
    },
    initDetail(){
        let id = /\/vote\/detail\/(\d+)/.exec(url)[1];
        voteFn.request({
            url:`/vote/all/detail/data?id=${id}`,
            success(result){
                let user = result.data;
                let headHtml = `
      <div class="personal">
				<div class="pl">
					<div class="head">
						<img src="${user.head_icon}" alt="">
					</div>
					<div class="p_descr">
						<p>${user.username}</p>
						<p>编号#${user.id}</p>
					</div>
				</div>
				<div class="pr">
					<div class="p_descr pr_descr">
						<p>${user.rank}名</p>
						<p>${user.vote}票</p>
					</div>
				</div>
				<div class="motto">
					${user.description}
				</div>
			</div>
			<div class="home register">
				<a href="/vote/index">
					活动首页
				</a>
			</div>
         `;
                $('.register_header').html(headHtml);

                let friendHtml = user.vfriend.map(function(friend){
                    return `
              <li>
              <div class="head">
                  <a href="#"><img src="${friend.head_icon}" alt=""></a>
              </div>
              <div class="up">
                <div class="vote">
                  <span>投了一票</span>
                </div>
              </div>
              <div class="descr">
                  <h3>${friend.username}</h3>
                  <p>编号#${friend.id}</p>
              </div>
          </li>
          `
                }).join('');
                $('.vflist').html(friendHtml);
            }
        })
    }

}
$(function () {
    if(indexRegex.test(url)){
        voteFn.initIndex();
    }else if(searchReg.test(url)){
        voteFn.initSearch();
    }else if(detailReg.test(url)){
        voteFn.initDetail()
    }

})