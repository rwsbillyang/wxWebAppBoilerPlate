import { Calendar, ColorPicker, TextEditor } from "framework7/types";
import { MyAsyncSelectProps } from "../AsyncSelectInput";
import { ItemBase, SelectOption, SortOption } from "./data";


// copy form ListInputProps, 因不能export，故只copy部分字段过来
export interface FieldMeta<T extends ItemBase> {
    depend?: (e?: Partial<T>) => boolean; //若指定了依赖：返回true时才显示该项否则不显示，没指定依赖，则都显示
    selectOptions?: SelectOption[]; //额外添加，当type为select时需指定
    objectProps?: FieldMeta<T>[]; // if type is object 
   
    sortOptions?: SortOption[]; //额外添加，当type为sort时需指定，用于搜索排序

    //if type is asyncSelect:  
    asyncSelectProps?: MyAsyncSelectProps;
 
    cfgPasteHandler?: (text: string) => Partial<T>; //某些字段在复制粘贴后，进行解析，自动填写某些字段 
    onPaste?:(event: React.ClipboardEvent<HTMLTextAreaElement>)=>void; //若指定了onPasteHandler则自动添加onPaste进行处理。https://www.kindacode.com/article/react-typescript-handle-oncopy-oncut-and-onpaste-events/

    isSearchKey?: boolean; //当为true时，则作为搜索字段进行搜索 

    name: string;//字段名称, 改为必须指定
    slot?: string;
    id?: string | number;
    className?: string;
    style?: React.CSSProperties;
    sortable?: boolean;
    media?: string;
    dropdown?: string | boolean;
    wrap?: boolean;
    input?: boolean;
    type?: string; //常用字段，如text, textarea, select,sort

    value?: string | number | Array<any> | Date | Object;
    defaultValue?: string | number | Array<any>;
    inputmode?: string;
    readonly?: boolean;
    required?: boolean;//常用字段
    disabled?: boolean;
    placeholder?: string;//常用字段
    inputId?: string | number;
    size?: string | number;
    accept?: string | number;
    autocomplete?: string;
    autocorrect?: string;
    autocapitalize?: string;
    spellcheck?: string;
    autofocus?: boolean;
    autosave?: string;
    max?: string | number;//常用字段
    min?: string | number;//常用字段
    step?: string | number;
    maxlength?: string | number;//常用字段
    minlength?: string | number;//常用字段
    multiple?: boolean;
    inputStyle?: React.CSSProperties;
    pattern?: string;//常用字段
    validate?: boolean | string;//常用字段
    validateOnBlur?: boolean;
    onValidate?: Function;
    tabindex?: string | number;
    resizable?: boolean;
    clearButton?: boolean;
    noFormStoreData?: boolean;
    noStoreData?: boolean;
    ignoreStoreData?: boolean;
    errorMessage?: string;//常用字段
    errorMessageForce?: boolean;
    info?: string;
    outline?: boolean;
    label?: string | number;
    inlineLabel?: boolean;
    floatingLabel?: boolean;
    color?: string;
    colorTheme?: string;
    textColor?: string;
    bgColor?: string;
    borderColor?: string;
    rippleColor?: string;
    themeDark?: boolean;

   
  calendarParams ?: Calendar.Parameters;
  colorPickerParams ?: ColorPicker.Parameters;
  textEditorParams ?: TextEditor.Parameters;

  onCalendarChange ?: (calendarValue?: any) => void;
  onColorPickerChange ?: (colorPickerValue?: any) => void;
  onTextareaResize ?: (event?: any) => void;
  onInputNotEmpty ?: (event?: any) => void;
  onInputEmpty ?: (event?: any) => void;
  onInputClear ?: (event?: any) => void;
  onInput ?: (...args: any[]) => void;
  onFocus ?: (...args: any[]) => void;
  onBlur ?: (...args: any[]) => void;
  onChange ?: (...args: any[]) => void;
  onTextEditorChange ?: (...args: any[]) => void;
  ref?: React.MutableRefObject<{el: HTMLElement | null}>;
}



//来自F7 ListProps
export interface MyListProps {
    slot?: string;
    id?: string | number;
    className?: string;
    style?: React.CSSProperties;
    inset?: boolean;
    xsmallInset?: boolean;
    smallInset?: boolean;
    mediumInset?: boolean;
    largeInset?: boolean;
    xlargeInset?: boolean;
    mediaList?: boolean; //可能会用到
    sortable?: boolean;
    sortableTapHold?: boolean;
    sortableEnabled?: boolean;
    sortableMoveElements?: boolean;
    sortableOpposite?: boolean;
    accordionList?: boolean;//可能会用到
    accordionOpposite?: boolean;
    contactsList?: boolean;//可能会用到
    simpleList?: boolean;//可能会用到
    linksList?: boolean;//可能会用到
    menuList?: boolean;//可能会用到
    noHairlines?: boolean;//可能会用到
    noHairlinesBetween?: boolean;//可能会用到
    noHairlinesMd?: boolean;//可能会用到
    noHairlinesBetweenMd?: boolean;//可能会用到
    noHairlinesIos?: boolean;
    noHairlinesBetweenIos?: boolean;
    noHairlinesAurora?: boolean;
    noHairlinesBetweenAurora?: boolean;
    noChevron?: boolean;
    chevronCenter?: boolean;
    tab?: boolean;
    tabActive?: boolean;
    form?: boolean;
    formStoreData?: boolean;
    inlineLabels?: boolean;
    virtualList?: boolean;
    virtualListParams?: Object;
    color?: string;
    colorTheme?: string;
    textColor?: string;
    bgColor?: string;
    borderColor?: string;
    rippleColor?: string;
    themeDark?: boolean;

}


// copy from ListItemProps
export interface MyListItemProps {
    slot?: string;
    id?: string | number;
    className?: string;
    style?: React.CSSProperties;
    title?: string | number;
    text?: string | number;
    media?: string;
    subtitle?: string | number;
    header?: string | number;
    footer?: string | number;
    tooltip?: string;
    tooltipTrigger?: string;
    link?: boolean | string;
    target?: string;
    tabLink?: boolean | string;
    tabLinkActive?: boolean;
    selected?: boolean;
    after?: string | number;
    badge?: string | number;
    badgeColor?: string;
    mediaItem?: boolean;
    mediaList?: boolean;
    divider?: boolean;
    groupTitle?: boolean;
    swipeout?: boolean;
    swipeoutOpened?: boolean;
    sortable?: boolean;
    sortableOpposite?: boolean;
    accordionItem?: boolean;
    accordionItemOpened?: boolean;
    smartSelect?: boolean;
    //smartSelectParams ?: SmartSelect.Parameters;
    noChevron?: boolean;
    chevronCenter?: boolean;
    checkbox?: boolean;
    radio?: boolean;
    radioIcon?: string;
    checked?: boolean;
    defaultChecked?: boolean;
    indeterminate?: boolean;
    name?: string;
    value?: string | number | Array<any>;
    readonly?: boolean;
    required?: boolean;
    disabled?: boolean;
    virtualListIndex?: number;
    color?: string;
    colorTheme?: string;
    textColor?: string;
    bgColor?: string;
    borderColor?: string;
    rippleColor?: string;
    themeDark?: boolean;
    back?: boolean;
    external?: boolean;
    force?: boolean;
    animate?: boolean;
    ignoreCache?: boolean;
    reloadCurrent?: boolean;
    reloadAll?: boolean;
    reloadPrevious?: boolean;
    reloadDetail?: boolean;
    routeTabId?: string;
    view?: string;
    routeProps?: any;
    preventRouter?: boolean;
    transition?: string;
    openIn?: string;
    searchbarEnable?: boolean | string;
    searchbarDisable?: boolean | string;
    searchbarClear?: boolean | string;
    searchbarToggle?: boolean | string;
    panelOpen?: boolean | string;
    panelClose?: boolean | string;
    panelToggle?: boolean | string;
    popupOpen?: boolean | string;
    popupClose?: boolean | string;
    actionsOpen?: boolean | string;
    actionsClose?: boolean | string;
    popoverOpen?: boolean | string;
    popoverClose?: boolean | string;
    loginScreenOpen?: boolean | string;
    loginScreenClose?: boolean | string;
    sheetOpen?: boolean | string;
    sheetClose?: boolean | string;
    sortableEnable?: boolean | string;
    sortableDisable?: boolean | string;
    sortableToggle?: boolean | string;
    cardOpen?: boolean | string;
    cardPreventOpen?: boolean | string;
    cardClose?: boolean | string;
    menuClose?: boolean | string;
    onClick?: (event?: any) => void;
    onSwipeoutOverswipeEnter?: (...args: any[]) => void;
    onSwipeoutOverswipeExit?: (...args: any[]) => void;
    onSwipeoutDeleted?: (...args: any[]) => void;
    onSwipeoutDelete?: (...args: any[]) => void;
    onSwipeoutClose?: (...args: any[]) => void;
    onSwipeoutClosed?: (...args: any[]) => void;
    onSwipeoutOpen?: (...args: any[]) => void;
    onSwipeoutOpened?: (...args: any[]) => void;
    onSwipeout?: (progress?: any) => void;
    onAccordionBeforeClose?: (prevent?: any) => void;
    onAccordionClose?: (...args: any[]) => void;
    onAccordionClosed?: (...args: any[]) => void;
    onAccordionBeforeOpen?: (prevent?: any) => void;
    onAccordionOpen?: (...args: any[]) => void;
    onAccordionOpened?: (...args: any[]) => void;
    onChange?: (event?: any) => void;
    // ref?: React.MutableRefObject<{el: HTMLElement | null; f7SmartSelect: () => SmartSelect.SmartSelect}>;
}

