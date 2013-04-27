define(function(require){
  require("libs/zepto.js");

  var Tooltip = require("src/tooltip.js");

  var lastContent = "";
  var contacting  = false;

  $("#W_email, #W_content").on("blur", function(){
    console.log("blur");
    Tooltip.hide( this );
  })

  $("#W_email"  ).on("invalid", function(){ invalid( $(this), "请输入你的Email。" ); return false; });
  $("#W_content").on("invalid", function(){ invalid( $(this), "请输入5个字以上有意义的内容。" ); return false; });
  $("#W_contact").on("submit", function( evt ){

    Tooltip.hide( $("#W_submit")[0] );

    if ( contacting ) { return false; }

    // Validate
    var d = validate();
    if ( !d ) { return false; }

    // Check for repeating.
    if ( lastContent == d.content ) {
      invalid( $("#W_content"), "你刚才已经发过一遍了。" );
      return false;
    }
    lastContent = d.content;

    showLoading();
    // Send a post.
    $.ajax({
          url      : "http://lmmail.herokuapp.com"
        , dataType : 'jsonp'
        , type     : "GET"
        , data     : d
        , success  : onSendSuccess
        , error    : onSendSuccess
        , complete : hideLoading
    });

    
    return false;
  });

  function validate() {
    // Validate
    var $email     = $("#W_email");
    var $content   = $("#W_content");
    var emailVal   = $email.val();
    var contentVal = $content.val();

    if ( !contentVal || contentVal.length < 6 ) {
      invalid( $content, "请输入5个字以上有意义的内容。" );
      return null;
    }

    if ( !emailVal || ! /[\w\d_\.\-]+@([\w\d_\-]+\.)+[\w\d]{2,4}/.test(emailVal) ) {
      invalid( $email, "请输入你的Email。" );
      return null;
    }

    return { "email" : emailVal, "content": contentVal };
  }

  function invalid ( $target, error ) {
    // TODO : Show customize popup;
    // If the error is shown on submit button, it is auto-closed.
    console.log( "Error : " + error );
    Tooltip.show( $target[0], { content : error, margin : 30 } );

    if ( $target.attr("id") == "W_submit" ) {
      setTimeout( function(){ Tooltip.hide($target[0]); }, 2000 );
    }
  }

  function showLoading() { contacting = true;  $("#W_contact").addClass("contacting");    }
  function hideLoading() { contacting = false; $("#W_contact").removeClass("contacting"); }

  function onSendSuccess ( data ) 
  {
    var e = "<div class='tac'>失败了，不如你直接发邮件给我吧：<a href='mailto:liangmorr@gmail.com'>liangmorr@gmail.com</a></div>";
    var s = "发送成功，我会尽快回复你的。";
    invalid( $("#W_submit"), data && data.result == "Success" ? s : e );
  }
});
