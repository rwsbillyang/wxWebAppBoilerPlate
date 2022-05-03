import React from "react"

import { Block, Icon, Link, Popover, Preloader } from "framework7-react"



export const LoadMore: React.FC<{loadMoreState: boolean, loadMore: () => void, isLoading?: boolean, isError?:boolean, errMsg?: string}>
    = ({ isLoading, loadMoreState, loadMore, isError, errMsg }) =>
        <div style={{ textAlign: 'center', paddingBottom: "25px" }}>
            {isLoading ? <Preloader /> : loadMoreState ?
                <Link onClick={loadMore}>加载更多</Link> :  <span style={{ color: 'gray', fontSize: "12px"}}>{isError? errMsg: "没有更多数据"}</span>}
        </div>




//没有数据或其它错误信息，通常用于列表页首次请求而没有数据的情况
export const NoDataOrErr: React.FC<{isLoading?: boolean, isError?:boolean, errMsg?: string, text?: string}>
    = ({ isLoading,  isError, errMsg, text }) =>
     <Block className="text-align-center">{isLoading? <Preloader size={42} /> : <span style={{ color: 'gray', fontSize: "12px"}} >{isError? errMsg: text||"暂无数据"}</span>}</Block>


//const Arrow = () => <><br /><Icon f7="arrow_down" size={16} color="gray" /><br /></>

// export const EditRemarkIcon: React.FC<{remark: GuestRemarkInfo}> = (props)  => 
// <Link iconOnly iconF7="pencil" iconSize={16} href="/admin/stats/guestEditRemark" routeProps={props?.remark} ></Link>



/**
 * 位置图标 + 位置文字
 * @param props 
 */
export const IconLocation: React.FC<{ str: string | undefined }> = (props) => <IconStringWidget str={props.str} icon="placemark"/>
/**
 * clock图标 + 位置文字
 * @param props 
 */
export const IconClockTime: React.FC<{ str: string | undefined }> = (props) => <IconStringWidget str={props.str} icon="clock"/>

export const IconDevice: React.FC<{ str: string | undefined }> = (props) => <IconStringWidget str={props.str} icon="device_phone_portrait"/>


export const IconStringWidget: React.FC<{ str?: string, icon: string }> = (props) => {
  if (props.str) return <>
    <Icon f7={props.icon} size={12} color="gray" style={{ marginBottom: '2px',marginRight:"1px" }} />{props.str}
  </>
  else return null
}


export const qrcodePopoverId = "popover-qrcode"
export const PopoverQrcode: React.FC<{popoverId?: string, qrcode?: string}> = (props) => {
  return <Popover id={props.popoverId || qrcodePopoverId} style={{ width: "150px", height: "150px" }}>
      <img src={props.qrcode} style={{ width: "120px", height: "120px", margin: "15px" }} />
  </Popover>
} 