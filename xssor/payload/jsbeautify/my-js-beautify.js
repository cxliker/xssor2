var the = {
    beautify_in_progress: false
}

function trim_leading_comments(str)
{
    // very basic. doesn't support /* ... */
    str = str.replace(/^(\s*\/\/[^\n]*\n)+/, '');
    str = str.replace(/^\s+/, '');
    return str;
}

function run_tests()
{
    var st = new SanityTest();
    run_beautifier_tests(st);
    JavascriptObfuscator.run_tests(st);
    P_A_C_K_E_R.run_tests(st);
    Urlencoded.run_tests(st);
    MyObfuscate.run_tests(st);
    $('#testresults').html(st.results()).show();
}

function any(a, b)
{
    return a ? a : b;
}

function unpacker_filter(source)
{
    var trailing_comments = '';
    var comment = '';
    var found = false;

    do {
        found = false;
        if (/^\s*\/\*/.test(source)) {
            found = true;
            comment = source.substr(0, source.indexOf('*/') + 2);
            source = source.substr(comment.length).replace(/^\s+/, '');
            trailing_comments += comment + "\n";
        } else if (/^\s*\/\//.test(source)) {
            found = true;
            comment = source.match(/^\s*\/\/.*/)[0];
            source = source.substr(comment.length).replace(/^\s+/, '');
            trailing_comments += comment + "\n";
        }
    } while (found);

    if (P_A_C_K_E_R.detect(source)) {
        source = unpacker_filter(P_A_C_K_E_R.unpack(source))
    }
    if (Urlencoded.detect(source)) {
        source = unpacker_filter(Urlencoded.unpack(source))
    }
    if (JavascriptObfuscator.detect(source)) {
        source = unpacker_filter(JavascriptObfuscator.unpack(source))
    }
    if (MyObfuscate.detect(source)) {
        source = unpacker_filter(MyObfuscate.unpack(source))
    }

    return trailing_comments + source;
}


function beautify()
{
    if (the.beautify_in_progress) return;

    the.beautify_in_progress = true;

    var source = $('#ende_textarea').val().replace(/^\s+/, '');
    var indent_size = $('#tabsize').val();
    var indent_char = indent_size == 1 ? '\t' : ' ';
    var preserve_newlines = $('#preserve-newlines').attr('checked');
    var keep_array_indentation = $('#keep-array-indentation').attr('checked');
    var brace_style = $('#brace-style').val();

    if ($('#detect-packers').attr('checked')) {
        source = unpacker_filter(source);
    }

    var comment_mark = '<-' + '-';
    var opts = {
                indent_size: indent_size,
                indent_char: indent_char,
                preserve_newlines:preserve_newlines,
                brace_style: brace_style,
                keep_array_indentation:keep_array_indentation,
                space_after_anon_function:true};

    if (source && source[0] === '<' && source.substring(0, 4) !== comment_mark) {
        $('#ende_textarea').val(
            html_beautify(source, opts)
        );
    } else {
        var v = js_beautify(unpacker_filter(source), opts);
        $('#ende_textarea').val(v);
    }

    the.beautify_in_progress = false;
}

function my_format(txt,compress/*是否为压缩模式*/){/* 格式化JSON源码(对象转换为JSON文本) */
        var indentChar = '    ';
        if(/^\s*$/.test(txt)){
            // alert('数据为空,无法格式化! ');
            return txt;
        }
        try{var data=eval('('+txt+')');}
        catch(e){
            alert('数据源语法错误,格式化失败! 错误信息: '+e.description,'err');
            return txt;
        };
        var draw=[],last=false,This=this,line=compress?'':'\n',nodeCount=0,maxDepth=0;

        var notify=function(name,value,isLast,indent/*缩进*/,formObj){
            nodeCount++;/*节点计数*/
            for (var i=0,tab='';i<indent;i++ )tab+=indentChar;/* 缩进HTML */
            tab=compress?'':tab;/*压缩模式忽略缩进*/
            maxDepth=++indent;/*缩进递增并记录*/
            if(value&&value.constructor==Array){/*处理数组*/
                draw.push(tab+(formObj?('"'+name+'":'):'')+'['+line);/*缩进'[' 然后换行*/
                for (var i=0;i<value.length;i++)
                    notify(i,value[i],i==value.length-1,indent,false);
                draw.push(tab+']'+(isLast?line:(','+line)));/*缩进']'换行,若非尾元素则添加逗号*/
            }else   if(value&&typeof value=='object'){/*处理对象*/
                    draw.push(tab+(formObj?('"'+name+'":'):'')+'{'+line);/*缩进'{' 然后换行*/
                    var len=0,i=0;
                    for(var key in value)len++;
                    for(var key in value)notify(key,value[key],++i==len,indent,true);
                    draw.push(tab+'}'+(isLast?line:(','+line)));/*缩进'}'换行,若非尾元素则添加逗号*/
                }else{
                        if(typeof value=='string')value='"'+value+'"';
                        draw.push(tab+(formObj?('"'+name+'":'):'')+value+(isLast?'':',')+line);
                };
        };
        var isLast=true,indent=0;
        notify('',data,isLast,indent,false);
        return draw.join('');
    }

function check()
{

    var source = $('#ende_textarea').val().replace(/^\s+/, '');
    try {
            var obj=JSON.parse(source);
            if(typeof obj == 'object' && obj ){
                return true;
            }else{
                return false;
            }
        } catch(e) {
            alert('error：'+'!!!'+e);
            return false;
        }
}

function ugly()
{
    var source = $('#ende_textarea').val().replace(/^\s+/, '');
    $('#ende_textarea').val(my_format(source, true));
}

$(function() {
    /*var default_text = "// This is just a sample script. Paste your real code here.\nif ('this_is'==/an_example/){of_beautifer();}else{var a=b?(c%d):e[f];}";
    $('#ende_textarea').val(default_text).bind('click focus', function () {
        if ($(this).val() == default_text) {
            $(this).val('');
        }
    }).bind('blur', function () {
        if ($(this).val() == '') {
            $(this).val(default_text);
        }

    })*/
    $('#jsbeautify').bind('click', beautify);
    $('#jscheck').bind('click', check);
    $('#jsugly').bind('click', ugly);
});

