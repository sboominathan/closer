$(document).ready( function() {
    var count = parseInt($(".coursecount").text());
    console.log(count);
    
    $(document).on('focus', 'div.form-group-options div.input-group-option:last-child input', function() {
        var sInputGroupHtml = $(this).parent().html();
        var sInputGroupClasses = $(this).parent().attr('class');
        $(this).parent().parent().append('<div class="'+sInputGroupClasses+'">'+sInputGroupHtml+'</div>');
        count+=1  
    });
    
    $(document).on('click', 'div.form-group-options .input-group-addon-remove', function() {
        if (count>1){
        $(this).parent().remove();
        count-=1;}
    });


    var str = $(".message").text();
    $("#sel1").val(str.slice(1,str.length-1));


    
});
