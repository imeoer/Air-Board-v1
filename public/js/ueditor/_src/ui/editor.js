///import core
///commands 全屏
///commandsName FullScreen
///commandsTitle  全屏
(function () {
    var utils = baidu.editor.utils,
        uiUtils = baidu.editor.ui.uiUtils,
        UIBase = baidu.editor.ui.UIBase;

    function EditorUI( options ) {
        this.initOptions( options );
        this.initEditorUI();
    }

    EditorUI.prototype = {
        uiName: 'editor',
        initEditorUI: function () {
            this.editor.ui = this;
            this._dialogs = {};
            this.initUIBase();
            this._initToolbars();
            var editor = this.editor;
            editor.addListener( 'ready', function () {
                baidu.editor.dom.domUtils.on( editor.window, 'scroll', function () {
                    baidu.editor.ui.Popup.postHide();
                } );

                //display bottom-bar label based on config
                if ( editor.options.elementPathEnabled ) {
                    editor.ui.getDom( 'elementpath' ).innerHTML = '<div class="edui-editor-breadcrumb">path:</div>';
                }
                if ( editor.options.wordCount ) {
                    editor.ui.getDom( 'wordcount' ).innerHTML = '字数统计';
                }
                if ( editor.selection.getNative() )
                    editor.fireEvent( 'selectionchange', false, true );
            } );
            editor.addListener( 'mousedown', function ( t, evt ) {
                var el = evt.target || evt.srcElement;
                baidu.editor.ui.Popup.postHide( el );
            } );
            editor.addListener( 'contextmenu', function ( t, evt ) {
                baidu.editor.ui.Popup.postHide();
            } );
            var me = this;
            editor.addListener( 'selectionchange', function () {
                me._updateElementPath();
                //字数统计
                me._wordCount();
            } );
            editor.addListener( 'sourcemodechanged', function ( t, mode ) {
                if ( editor.options.elementPathEnabled ) {
                    if ( mode ) {
                        me.disableElementPath();
                    } else {
                        me.enableElementPath();
                    }
                }
                if ( editor.options.wordCount ) {
                    if ( mode ) {
                        me.disableWordCount();
                    } else {
                        me.enableWordCount();
                    }
                }


            } );
            // 超链接的编辑器浮层
            var linkDialog = new baidu.editor.ui.Dialog( {
                iframeUrl: editor.ui.mapUrl( me.editor.options.iframeUrlMap.link ),
                autoReset: true,
                draggable: true,
                editor: editor,
                className: 'edui-for-link',
                title: '超链接',
                buttons: [
                    {
                        className: 'edui-okbutton',
                        label: '确认',
                        onclick: function () {
                            linkDialog.close( true );
                        }
                    },
                    {
                        className: 'edui-cancelbutton',
                        label: '取消',
                        onclick: function () {
                            linkDialog.close( false );
                        }
                    }
                ],
                onok: function () {
                },
                oncancel: function () {
                },
                onclose: function ( t, ok ) {
                    if ( ok ) {
                        return this.onok();
                    } else {
                        return this.oncancel();
                    }
                }

            } );
            linkDialog.render();
            // 图片的编辑器浮层
            var imgDialog = new baidu.editor.ui.Dialog( {
                iframeUrl: editor.ui.mapUrl( me.editor.options.iframeUrlMap.insertimage ),
                autoReset: true,
                draggable: true,
                editor: editor,
                className: 'edui-for-insertimage',
                title: '图片',
                buttons: [
                    {
                        className: 'edui-okbutton',
                        label: '确认',
                        onclick: function () {
                            imgDialog.close( true );
                        }
                    },
                    {
                        className: 'edui-cancelbutton',
                        label: '取消',
                        onclick: function () {
                            imgDialog.close( false );
                        }
                    }
                ],
                onok: function () {
                },
                oncancel: function () {
                },
                onclose: function ( t, ok ) {
                    if ( ok ) {
                        return this.onok();
                    } else {
                        return this.oncancel();
                    }
                }

            } );
            imgDialog.render();
            //锚点
            var anchorDialog = new baidu.editor.ui.Dialog( {
                iframeUrl: editor.ui.mapUrl( me.editor.options.iframeUrlMap.anchor ),
                autoReset: true,
                draggable: true,
                editor: editor,
                className: 'edui-for-anchor',
                title: '锚点',
                buttons: [
                    {
                        className: 'edui-okbutton',
                        label: '确认',
                        onclick: function () {
                            anchorDialog.close( true );
                        }
                    },
                    {
                        className: 'edui-cancelbutton',
                        label: '取消',
                        onclick: function () {
                            anchorDialog.close( false );
                        }
                    }
                ],
                onok: function () {
                },
                oncancel: function () {
                },
                onclose: function ( t, ok ) {
                    if ( ok ) {
                        return this.onok();
                    } else {
                        return this.oncancel();
                    }
                }

            } );
            anchorDialog.render();
            // video
            var videoDialog = new baidu.editor.ui.Dialog( {
                iframeUrl: editor.ui.mapUrl( me.editor.options.iframeUrlMap.insertvideo ),
                autoReset: true,
                draggable: true,
                editor: editor,
                className: 'edui-for-insertvideo',
                title: '视频',
                buttons: [
                    {
                        className: 'edui-okbutton',
                        label: '确认',
                        onclick: function () {
                            videoDialog.close( true );
                        }
                    },
                    {
                        className: 'edui-cancelbutton',
                        label: '取消',
                        onclick: function () {
                            videoDialog.close( false );
                        }
                    }
                ],
                onok: function () {
                },
                oncancel: function () {
                },
                onclose: function ( t, ok ) {
                    if ( ok ) {
                        return this.onok();
                    } else {
                        return this.oncancel();
                    }
                }

            } );
            videoDialog.render();

            //本地word图片上传
            var wordImageDialog = new baidu.editor.ui.Dialog( {
                iframeUrl: editor.ui.mapUrl( me.editor.options.iframeUrlMap.wordimage ),
                autoReset: true,
                draggable: true,
                editor: editor,
                className: 'edui-for-wordimage',
                title: '图片转存',
                buttons: [
                    {
                        className: 'edui-okbutton',
                        label: '确认',
                        onclick: function () {
                            wordImageDialog.close( true );
                        }
                    },
                    {
                        className: 'edui-cancelbutton',
                        label: '取消',
                        onclick: function () {
                            wordImageDialog.close( false );
                        }
                    }
                ],
                onok: function () {
                },
                oncancel: function () {
                },
                onclose: function ( t, ok ) {
                    if ( ok ) {
                        return this.onok();
                    } else {
                        return this.oncancel();
                    }
                }
            } );
            wordImageDialog.render();
            //挂载dialog框到ui实例
            me._dialogs['wordImageDialog'] = wordImageDialog;

            // map
            var mapDialog = new baidu.editor.ui.Dialog( {
                iframeUrl: editor.ui.mapUrl( me.editor.options.iframeUrlMap.map ),
                autoReset: true,
                draggable: true,
                editor: editor,
                className: 'edui-for-map',
                title: '地图',
                buttons: [
                    {
                        className: 'edui-okbutton',
                        label: '确认',
                        onclick: function () {
                            mapDialog.close( true );
                        }
                    },
                    {
                        className: 'edui-cancelbutton',
                        label: '取消',
                        onclick: function () {
                            mapDialog.close( false );
                        }
                    }
                ],
                onok: function () {
                },
                oncancel: function () {
                },
                onclose: function ( t, ok ) {
                    if ( ok ) {
                        return this.onok();
                    } else {
                        return this.oncancel();
                    }
                }

            } );
            mapDialog.render();
            // map
            var gmapDialog = new baidu.editor.ui.Dialog( {
                iframeUrl: editor.ui.mapUrl( me.editor.options.iframeUrlMap.gmap ),
                autoReset: true,
                draggable: true,
                editor: editor,
                className: 'edui-for-gmap',
                title: 'Google地图',
                buttons: [
                    {
                        className: 'edui-okbutton',
                        label: '确认',
                        onclick: function () {
                            gmapDialog.close( true );
                        }
                    },
                    {
                        className: 'edui-cancelbutton',
                        label: '取消',
                        onclick: function () {
                            gmapDialog.close( false );
                        }
                    }
                ],
                onok: function () {
                },
                oncancel: function () {
                },
                onclose: function ( t, ok ) {
                    if ( ok ) {
                        return this.onok();
                    } else {
                        return this.oncancel();
                    }
                }

            } );
            gmapDialog.render();
            var popup = new baidu.editor.ui.Popup( {
                editor:editor,
                content: '',
                className: 'edui-bubble',
                _onEditButtonClick: function () {
                    this.hide();
                    linkDialog.open();
                },
                _onImgEditButtonClick: function () {
                    this.hide();
                    var nodeStart = editor.selection.getRange().getClosedNode();
                    var img = baidu.editor.dom.domUtils.findParentByTagName( nodeStart, "img", true );
                    if ( img && img.className.indexOf( "edui-faked-video" ) != -1 ) {
                        videoDialog.open();
                    } else if ( img && img.src.indexOf( "http://api.map.baidu.com" ) != -1 ) {
                        mapDialog.open();
                    } else if ( img && img.src.indexOf( "http://maps.google.com/maps/api/staticmap" ) != -1 ) {
                        gmapDialog.open();
                    } else if ( img && img.getAttribute( "anchorname" ) ) {
                        anchorDialog.open();
                    } else {
                        imgDialog.open();
                    }

                },
                _getImg: function () {
                    var img = editor.selection.getRange().getClosedNode();
                    if ( img && (img.nodeName == 'img' || img.nodeName == 'IMG') ) {
                        return img;
                    }
                    return null;
                },
                _onImgSetFloat: function( value ) {
                    if ( this._getImg() ) {
                        editor.execCommand( "imagefloat", value );
                        var img = this._getImg();
                        if ( img ) {
                            this.showAnchor( img );
                        }
                    }
                },
                _setIframeAlign: function( value ) {
                    var frame = popup.anchorEl;
                    var newFrame = frame.cloneNode( true );
                    switch ( value ) {
                        case -2:
                            newFrame.setAttribute( "align", "" );
                            break;
                        case -1:
                            newFrame.setAttribute( "align", "left" );
                            break;
                        case 1:
                            newFrame.setAttribute( "align", "right" );
                            break;
                        case 2:
                            newFrame.setAttribute( "align", "middle" );
                            break;
                    }
                    frame.parentNode.insertBefore( newFrame, frame );
                    baidu.editor.dom.domUtils.remove( frame );
                    popup.anchorEl = newFrame;
                    popup.showAnchor( popup.anchorEl );
                },
                _updateIframe: function() {
                    editor._iframe = popup.anchorEl;
                    insertframe.open();
                    popup.hide();
                },
                _onRemoveButtonClick: function () {
                    var nodeStart = editor.selection.getRange().getClosedNode();
                    var img = baidu.editor.dom.domUtils.findParentByTagName( nodeStart, "img", true );
                    if ( img && img.getAttribute( "anchorname" ) ) {
                        editor.execCommand( "anchor" );
                    } else {
                        editor.execCommand( 'unlink' );
                    }
                    this.hide();
                },
                queryAutoHide: function ( el ) {
                    if ( el && el.ownerDocument == editor.document ) {
                        if ( el.tagName.toLowerCase() == 'img' || baidu.editor.dom.domUtils.findParentByTagName( el, 'a', true ) ) {
                            return el !== popup.anchorEl;
                        }
                    }
                    return baidu.editor.ui.Popup.prototype.queryAutoHide.call( this, el );
                }
            } );
            popup.render();
            //iframe
            var insertframe = new baidu.editor.ui.Dialog( {
                iframeUrl: editor.ui.mapUrl( me.editor.options.iframeUrlMap.insertframe ),
                autoReset: true,
                draggable: true,
                editor: editor,
                className: 'edui-for-insertframe',
                title: '插入iframe',
                buttons: [
                    {
                        className: 'edui-okbutton',
                        label: '确认',
                        onclick: function () {
                            insertframe.close( true );
                        }
                    },
                    {
                        className: 'edui-cancelbutton',
                        label: '取消',
                        onclick: function () {
                            insertframe.close( false );
                        }
                    }
                ],
                onok: function () {
                },
                oncancel: function () {
                },
                onclose: function ( t, ok ) {
                    if ( ok ) {
                        return this.onok();
                    } else {
                        return this.oncancel();
                    }
                }

            } );
            insertframe.render();
            editor.addListener( 'mouseover', function( t, evt ) {
                evt = evt || window.event;
                var el = evt.target || evt.srcElement;
                if ( /iframe/ig.test( el.tagName ) && editor.options.imagePopup ) {
                    var html = popup.formatHtml(
                        '<nobr>属性: <span onclick=$$._setIframeAlign(-2) class="edui-clickable">默认</span>&nbsp;&nbsp;<span onclick=$$._setIframeAlign(-1) class="edui-clickable">左对齐</span>&nbsp;&nbsp;<span onclick=$$._setIframeAlign(1) class="edui-clickable">右对齐</span>&nbsp;&nbsp;' +
                            '<span onclick=$$._setIframeAlign(2) class="edui-clickable">居中</span>' +
                            ' <span onclick="$$._updateIframe( this);" class="edui-clickable">修改</span></nobr>' );
                    if ( html ) {
                        popup.getDom( 'content' ).innerHTML = html;
                        popup.anchorEl = el;
                        popup.showAnchor( popup.anchorEl );
                    } else {
                        popup.hide();
                    }
                }
            } );
            editor.addListener( 'selectionchange', function ( t, causeByUi ) {
                if ( !causeByUi ) return;
                var html = '';
                var img = editor.selection.getRange().getClosedNode();
                if ( img != null && img.tagName.toLowerCase() == 'img' ) {
                    if ( img.getAttribute( 'anchorname' ) ) {
                        //锚点处理
                        html += popup.formatHtml(
                            '<nobr>属性: <span onclick=$$._onImgEditButtonClick(event) class="edui-clickable">修改</span>&nbsp;&nbsp;<span onclick=$$._onRemoveButtonClick(event) class="edui-clickable">删除</span></nobr>' );
                    } else if ( editor.options.imagePopup ) {
                        html += popup.formatHtml(
                            '<nobr>属性: <span onclick=$$._onImgSetFloat("none") class="edui-clickable">默认</span>&nbsp;&nbsp;<span onclick=$$._onImgSetFloat("left") class="edui-clickable">居左</span>&nbsp;&nbsp;<span onclick=$$._onImgSetFloat("right") class="edui-clickable">居右</span>&nbsp;&nbsp;' +
                                '<span onclick=$$._onImgSetFloat("center") class="edui-clickable">居中</span>' +
                                ' <span onclick="$$._onImgEditButtonClick(event, this);" class="edui-clickable">修改</span></nobr>' );
                    }
                }
                var link;
                if ( editor.selection.getRange().collapsed ) {
                    link = editor.queryCommandValue( "link" );
                } else {
                    link = editor.selection.getStart();
                }
                link = baidu.editor.dom.domUtils.findParentByTagName( link, "a", true );
                var url;
                if ( link != null && (url = (link.getAttribute( 'data_ue_src' ) || link.getAttribute( 'href', 2 ))) != null ) {
                    var txt = url;
                    if ( url.length > 30 ) {
                        txt = url.substring( 0, 20 ) + "...";
                    }
                    if ( html ) {
                        html += '<div style="height:5px;"></div>'
                    }
                    html += popup.formatHtml(
                        '<nobr>链接: <a target="_blank" href="' + url + '" title="' + url + '" >' + txt + '</a>' +
                            ' <span class="edui-clickable" onclick="$$._onEditButtonClick(event, this);">修改</span>' +
                            ' <span class="edui-clickable" onclick="$$._onRemoveButtonClick(event, this);"> 清除</span></nobr>' );
                    popup.showAnchor( link );
                }
                if ( html ) {
                    popup.getDom( 'content' ).innerHTML = html;
                    popup.anchorEl = img || link;
                    popup.showAnchor( popup.anchorEl );
                } else {
                    popup.hide();
                }
            } );
        },
        _initToolbars: function () {
            var editor = this.editor;
            var toolbars = this.toolbars || [];
            var toolbarUis = [];
            for ( var i = 0; i < toolbars.length; i++ ) {
                var toolbar = toolbars[i];
                var toolbarUi = new baidu.editor.ui.Toolbar();
                for ( var j = 0; j < toolbar.length; j++ ) {
                    var toolbarItem = toolbar[j];
                    var toolbarItemUi = null;
                    if ( typeof toolbarItem == 'string' ) {
                        if ( toolbarItem == '|' ) {
                            toolbarItem = 'Separator';
                        }

                        if ( baidu.editor.ui[toolbarItem] ) {
                            toolbarItemUi = new baidu.editor.ui[toolbarItem]( editor );
                        }

                        //todo fullscreen这里单独处理一下，放到首行去
                        if ( toolbarItem == 'FullScreen' ) {
                            if ( toolbarUis && toolbarUis[0] ) {
                                toolbarUis[0].items.splice( 0, 0, toolbarItemUi );
                            } else {
                                toolbarUi.items.splice( 0, 0, toolbarItemUi );
                            }

                            continue;


                        }
                    } else {
                        toolbarItemUi = toolbarItem;
                    }
                    if ( toolbarItemUi ) {
                        toolbarUi.add( toolbarItemUi );
                    }
                }
                toolbarUis[i] = toolbarUi;
            }
            this.toolbars = toolbarUis;
        },
        getHtmlTpl: function () {
            return '<div id="##" class="%%">' +
                '<div id="##_toolbarbox" class="%%-toolbarbox">' +
                '<div id="##_toolbarboxouter" class="%%-toolbarboxouter"><div class="%%-toolbarboxinner">' +
                this.renderToolbarBoxHtml() +
                '</div></div>' +
                '<div id="##_toolbarmsg" class="%%-toolbarmsg" style="display:none;">' +
                '<div id = "##_upload_dialog" class="%%-toolbarmsg-upload" onclick="$$.showWordImageDialog();">点此上传</div>' +
                '<div class="%%-toolbarmsg-close" onclick="$$.hideToolbarMsg();">x</div>' +
                '<div id="##_toolbarmsg_label" class="%%-toolbarmsg-label"></div>' +
                '<div style="height:0;overflow:hidden;clear:both;"></div>' +
                '</div>' +
                '</div>' +
                '<div id="##_iframeholder" class="%%-iframeholder"></div>' +
                //modify wdcount by matao
                '<div id="##_bottombar" class="%%-bottomContainer"><table><tr>' +
                '<td id="##_elementpath" class="%%-bottombar"></td>' +
                '<td id="##_wordcount" class="%%-wordcount"></td>' +
                '</tr></table></div>' +
                '</div>';
        },
        showWordImageDialog:function() {
            this.editor.execCommand( "checkimage", "_localImages" );
            this._dialogs['wordImageDialog'].open();
        },
        renderToolbarBoxHtml: function () {
            var buff = [];
            for ( var i = 0; i < this.toolbars.length; i++ ) {
                buff.push( this.toolbars[i].renderHtml() );
            }
            return buff.join( '' );
        },
        setFullScreen: function ( fullscreen ) {
            function fixGecko( editor ) {
                editor.body.contentEditable = false;
                setTimeout( function() {
                    editor.body.contentEditable = true;
                }, 200 )
            }

            if ( this._fullscreen != fullscreen ) {
                this._fullscreen = fullscreen;
                this.editor.fireEvent( 'beforefullscreenchange', fullscreen );
                var editor = this.editor;

                if ( baidu.editor.browser.gecko ) {
                    var bk = editor.selection.getRange().createBookmark();
                }

                if ( fullscreen ) {

                    this._bakHtmlOverflow = document.documentElement.style.overflow;
                    this._bakBodyOverflow = document.body.style.overflow;
                    this._bakAutoHeight = this.editor.autoHeightEnabled;
                    this._bakScrollTop = Math.max( document.documentElement.scrollTop, document.body.scrollTop );
                    if ( this._bakAutoHeight ) {
                        this.editor.disableAutoHeight();
                    }

                    document.documentElement.style.overflow = 'hidden';
                    document.body.style.overflow = 'hidden';

                    this._bakCssText = this.getDom().style.cssText;
                    this._bakCssText1 = this.getDom( 'iframeholder' ).style.cssText;
                    this._updateFullScreen();

                } else {


                    this.getDom().style.cssText = this._bakCssText;
                    this.getDom( 'iframeholder' ).style.cssText = this._bakCssText1;
                    if ( this._bakAutoHeight ) {
                        this.editor.enableAutoHeight();
                    }
                    document.documentElement.style.overflow = this._bakHtmlOverflow;
                    document.body.style.overflow = this._bakBodyOverflow;
                    window.scrollTo( 0, this._bakScrollTop );
                }
                if ( baidu.editor.browser.gecko ) {

                    var input = document.createElement( 'input' );

                    document.body.appendChild( input );

                    editor.body.contentEditable = false;
                    setTimeout( function() {

                        input.focus();
                        setTimeout( function() {
                            editor.body.contentEditable = true;
                            editor.selection.getRange().moveToBookmark( bk ).select( true );
                            baidu.editor.dom.domUtils.remove( input );

                            fullscreen && window.scroll( 0, 0 );

                        } )

                    } )
                }

                this.editor.fireEvent( 'fullscreenchanged', fullscreen );
                this.triggerLayout();
            }
        },
        _wordCount:function() {
            var wdcount = this.getDom( 'wordcount' );
            if ( !this.editor.options.wordCount ) {
                wdcount.style.display = "none";
                return;
            }
            wdcount.innerHTML = this.editor.queryCommandValue( "wordcount" );
        },
        disableWordCount: function () {
            var w = this.getDom( 'wordcount' );
            w.innerHTML = '';
            w.style.display = 'none';
            this.wordcount = false;

        },
        enableWordCount: function () {
            var w = this.getDom( 'wordcount' );
            w.style.display = '';
            this.wordcount = true;
            this._wordCount();
        },
        _updateFullScreen: function () {
            if ( this._fullscreen ) {
                var vpRect = uiUtils.getViewportRect();
                this.getDom().style.cssText = 'border:0;position:absolute;left:0;top:0;width:' + vpRect.width + 'px;height:' + vpRect.height + 'px;z-index:' + (this.getDom().style.zIndex * 1 + 100);
                uiUtils.setViewportOffset( this.getDom(), { left: 0, top: 0 } );
                this.editor.setHeight( vpRect.height - this.getDom( 'toolbarbox' ).offsetHeight - this.getDom( 'bottombar' ).offsetHeight );

            }
        },
        _updateElementPath: function () {
            var bottom = this.getDom( 'elementpath' );
            if ( this.elementPathEnabled ) {
                var list = this.editor.queryCommandValue( 'elementpath' );
                var buff = [];
                for ( var i = 0,ci; ci = list[i]; i++ ) {
                    buff[i] = this.formatHtml( '<span unselectable="on" onclick="$$.editor.execCommand(&quot;elementpath&quot;, &quot;' + i + '&quot;);">' + ci + '</span>' );
                }
                bottom.innerHTML = '<div class="edui-editor-breadcrumb" onmousedown="return false;">path: ' + buff.join( ' &gt; ' ) + '</div>';

            } else {
                bottom.style.display = 'none'
            }
        },
        disableElementPath: function () {
            var bottom = this.getDom( 'elementpath' );
            bottom.innerHTML = '';
            bottom.style.display = 'none';
            this.elementPathEnabled = false;

        },
        enableElementPath: function () {
            var bottom = this.getDom( 'elementpath' );
            bottom.style.display = '';
            this.elementPathEnabled = true;
            this._updateElementPath();
        },
        isFullScreen: function () {
            return this._fullscreen;
        },
        postRender: function () {
            UIBase.prototype.postRender.call( this );
            for ( var i = 0; i < this.toolbars.length; i++ ) {
                this.toolbars[i].postRender();
            }
            var me = this;
            var timerId,
                domUtils = baidu.editor.dom.domUtils,
                updateFullScreenTime = function() {
                    clearTimeout( timerId );
                    timerId = setTimeout( function () {
                        me._updateFullScreen();
                    } );
                };
            domUtils.on( window, 'resize', updateFullScreenTime );

            me.addListener( 'destroy', function() {
                domUtils.un( window, 'resize', updateFullScreenTime );
                clearTimeout( timerId );
            } )
        },
        showToolbarMsg: function ( msg, flag ) {
            this.getDom( 'toolbarmsg_label' ).innerHTML = msg;
            this.getDom( 'toolbarmsg' ).style.display = '';
            //
            if ( !flag ) {
                var w = this.getDom( 'upload_dialog' );
                w.style.display = 'none';
            }
        },
        hideToolbarMsg: function () {
            this.getDom( 'toolbarmsg' ).style.display = 'none';
        },
        mapUrl: function ( url ) {
            return url.replace( '~/', this.editor.options.UEDITOR_HOME_URL || '' );
        },
        triggerLayout: function () {
            var dom = this.getDom();
            if ( dom.style.zoom == '1' ) {
                dom.style.zoom = '100%';
            } else {
                dom.style.zoom = '1';
            }
        }
    };
    utils.inherits( EditorUI, baidu.editor.ui.UIBase );

    baidu.editor.ui.Editor = function ( options ) {

        var editor = new baidu.editor.Editor( options );
        editor.options.editor = editor;
        new EditorUI( editor.options );


        var oldRender = editor.render;
        editor.render = function ( holder ) {

            if ( holder ) {
                if ( holder.constructor === String ) {
                    holder = document.getElementById( holder );
                }
                holder && holder.getAttribute( 'name' ) && ( editor.options.textarea = holder.getAttribute( 'name' ));
                if ( holder && /script|textarea/ig.test( holder.tagName ) ) {
                    var newDiv = document.createElement( 'div' );
                    holder.parentNode.insertBefore( newDiv, holder );
                    editor.options.initialContent = holder.value || holder.innerHTML;

                    holder.id && (newDiv.id = holder.id);

                    holder.className && (newDiv.className = holder.className);
                    holder.style.cssText && (newDiv.style.cssText = holder.style.cssText);
                    holder.parentNode.removeChild( holder );
                    holder = newDiv;
                    holder.innerHTML = '';
                }

            }

            editor.ui.render( holder );
            var iframeholder = editor.ui.getDom( 'iframeholder' );
            //给实例添加一个编辑器的容器引用
            editor.container = editor.ui.getDom();
            editor.container.style.zIndex = editor.options.zIndex;
            oldRender.call( editor, iframeholder );
        };
        return editor;
    };
})();