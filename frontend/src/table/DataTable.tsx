import {
    Card, Input, Link, NotificationPlugin,
    Select,
    Table,
    Textarea
} from "tdesign-react";
import {digitUppercase} from "pixiu-number-toolkit";
import {useEffect, useMemo, useState} from "react";
import {setLocalstorageItem} from "../common/utils";

const needRepayColumns = ["id","name","amountChinese","amount","paymentMethod","repayAmountChinese","repayAmount","repayMethod","platform","remark","options"]
const noNeedRepayColumns = ["id","name","amountChinese","amount","paymentMethod","platform","remark","options"]
const DataTable = () => {
    const [displayColumns,setDisplayColumns] = useState(needRepayColumns)
    const [needRepay, setNeedRepay] = useState(false)
    const [platformOption, setPlatformOption] = useState<{ label: string, value: string }[]>([])
    const [pageInfo, setPageInfo] = useState({page: 1, size: 10, total: 0})
    const [pageData, setPageData] = useState<{
        id: number,
        name: string,
        amount: number,
        paymentMethod: string,
        remark: string,
        repayMethod: string,
        repayAmount: number,
        platform:string,
    }[]>([])
    const [dataChangeTemp, setDataChangeTemp] = useState<{
        id: number,
        name: string,
        amount: number,
        paymentMethod: string,
        remark: string,
        repayMethod: string,
        repayAmount: number,
        platform:string,
    }[]>([])
    const [totalAmount, setTotalAmount] = useState({
        collect: {total: 0, cash: 0, wechat: 0, alipay: 0, other: 0},
        repay: {total: 0, card: 0, cash: 0, wechat: 0, alipay: 0, other: 0}
    })
    const [pageTotalAmount, setPageTotalAmount] = useState({
        collect: {total: 0, cash: 0, wechat: 0, alipay: 0, other: 0},
        repay: {total: 0, card: 0, cash: 0, wechat: 0, alipay: 0, other: 0}
    })
    const [pageUserCount, setPageUserCount] = useState(0)
    const [editableId, setEditableId] = useState<number[]>([])
    const columns = useMemo(() => {
        const cols = [
            {colKey: 'id', title: 'ID'},
            {
                colKey: 'name', title: '姓名', edit: {
                    component: Input,
                    showEditIcon: false,
                }
            },
            {
                colKey: 'amountChinese', title: '收礼金额(大写)', cell: ({row}: { row: any }) => {
                    return digitUppercase(row.amount ?? 0);
                }
            },
            {
                colKey: 'amount', title: '收礼金额(数字)', edit: {
                    component: Input,
                    showEditIcon: false,
                    props: {
                        type: "number",
                    }
                }
            },
            {
                colKey: 'paymentMethod', title: '收礼方式', edit: {
                    component: Select,
                    showEditIcon: false,
                    props: {
                        options: [
                            {label: '现金', value: '现金'},
                            {label: '微信', value: '微信'},
                            {label: '支付宝', value: '支付宝'},
                            {label: '其他', value: '其他'},
                        ],
                    }
                }
            },
            {
                colKey: 'repayAmountChinese', title: '返礼金额/数量(大写)', cell: ({row}: { row: any }) => {
                    let content = digitUppercase(row.repayAmount ?? 0)
                    if (row.repayMethod === '返卡') {
                        content = content.replaceAll('元整','张')
                    }
                    return ;
                }
            },
            {
                colKey: 'repayAmount', title: '返礼金额/数量(数字)', edit: {
                    component: Input,
                    showEditIcon: false,
                    props: {
                        type: "number",
                    }
                }
            },
            {
                colKey: 'repayMethod', title: '返礼方式', edit: {
                    component: Select,
                    showEditIcon: false,
                    props: {
                        options: [
                            {label: '返卡', value: '返卡'},
                            {label: '微信', value: '微信'},
                            {label: '支付宝', value: '支付宝'},
                            {label: '其他', value: '其他'},
                        ],
                    }
                }
            },
            {
                colKey: 'platform', title: '收礼方', edit: {
                    component: Select,
                    showEditIcon: false,
                    props: {
                        options: platformOption,
                    }
                }
            },
            {
                colKey: 'remark', title: '备注', edit: {
                    component: Textarea,
                    showEditIcon: false,
                    props: {
                        autosize: {minRows: 2, maxRows: 5}
                    }
                }
            },
            {
                colKey: 'options', title: '操作', cell: ({row}: { row: any }) => {
                    return (<>
                        {!editableId.includes(row.id) && (
                            <Link theme="primary" hover="color" data-id={row.id} onClick={editRow}>修改</Link>)}
                        {editableId.includes(row.id) && (<>
                            <Link theme="primary" hover="color" data-id={row.id} onClick={saveRow}>保存</Link>
                            <Link theme="primary" hover="color" style={{marginLeft: "8px"}} data-id={row.id}
                                  onClick={cancelEdit}>取消</Link>
                        </>)}
                    </>)
                }
            }
        ]
        var retCols: any[] = []
        for (let i = 0 ; i < displayColumns.length; i++) {
            const key = displayColumns[i]
            const dataIndex = cols.findIndex((t) => t.colKey === key);
            retCols = retCols.concat([cols[dataIndex]])
        }
        return retCols
        // eslint-disable-next-line
    }, [platformOption, editableId, displayColumns])

    window.addEventListener('storage',(event) => {
        switch(event.key) {
            case 'pageData':
                const pd = JSON.parse(event.newValue ?? '[]')
                setPageData(pd)
                setPageInfo({...pageInfo, total: pd.length})
                // 计算统计信息
                calcTotalAmount()
                setLocalstorageItem('exportData',JSON.stringify(getExportData()))
                break;
            case 'platformOption':
                setPlatformOption(JSON.parse(event.newValue ?? '[]'))
                break
            case 'needRepay':
                if (event.newValue === 'true') {
                    console.log('true')
                    setNeedRepay(true)
                    setDisplayColumns(needRepayColumns)
                    setLocalstorageItem('exportData',JSON.stringify(getExportData()))
                } else {
                    console.log('false')
                    setNeedRepay(false)
                    setDisplayColumns(noNeedRepayColumns)
                    setLocalstorageItem('exportData',JSON.stringify(getExportData()))
                }
        }
    })

    // 组件初始化
    useEffect(() => {
        const pd = JSON.parse(localStorage.getItem('pageData') ?? '[]')
        setPageData(pd)
        setPageInfo({...pageInfo, total: pd.length})
        setPlatformOption(JSON.parse(localStorage.getItem('platformOption') ?? '[]'))
        if (localStorage.getItem('needRepay') === 'true') {
            setNeedRepay(true)
            setDisplayColumns(needRepayColumns)
        } else {
            setNeedRepay(false)
            setDisplayColumns(noNeedRepayColumns)
        }
        calcTotalAmount()
        setLocalstorageItem('exportData',JSON.stringify(getExportData()))
    }, []);

    // 计算当前页总金额
    useEffect(() => {
        let pta = {
            collect: {total: 0, cash: 0, wechat: 0, alipay: 0, other: 0},
            repay: {total: 0, card: 0, cash: 0, wechat: 0, alipay: 0, other: 0}
        }
        let count = 0
        for (let i = (pageInfo.page - 1) * pageInfo.size; i < pageInfo.size * pageInfo.page; i++) {
            if (i >= pageData.length) {
                break
            }
            count++
            const thisData = pageData[i]
            pta.collect.total += thisData.amount
            switch (thisData.paymentMethod) {
                case '现金':
                    pta.collect.cash += thisData.amount
                    break;
                case '微信':
                    pta.collect.wechat += thisData.amount
                    break;
                case '支付宝':
                    pta.collect.alipay += thisData.amount
                    break;
                case '其他':
                    pta.collect.alipay += thisData.amount
                    break
            }
            pta.repay.total += thisData.repayAmount ?? 0
            switch (thisData.repayMethod) {
                case '现金':
                    pta.repay.cash += thisData.repayAmount ?? 0
                    break
                case '返卡':
                    pta.repay.card += thisData.repayAmount ?? 0
                    break
                case '微信':
                    pta.repay.wechat += thisData.repayAmount ?? 0
                    break
                case '支付宝':
                    pta.repay.alipay += thisData.repayAmount ?? 0
                    break
                case '其他':
                    pta.repay.other += thisData.repayAmount ?? 0
                    break
            }
        }
        setPageUserCount(count)
        setPageTotalAmount(pta)
    }, [pageInfo,pageData])

    const calcTotalAmount = () => {
        let tm = {
            collect: {total: 0, cash: 0, wechat: 0, alipay: 0, other: 0},
            repay: {total: 0, card: 0, cash: 0, wechat: 0, alipay: 0, other: 0}
        }
        for (let i = 0; i < pageData.length; i++) {
            const thisData = pageData[i]
            tm.collect.total += thisData.amount
            switch (thisData.paymentMethod) {
                case '现金':
                    tm.collect.cash += thisData.amount
                    break;
                case '微信':
                    tm.collect.wechat += thisData.amount
                    break;
                case '支付宝':
                    tm.collect.alipay += thisData.amount
                    break;
                case '其他':
                    tm.collect.alipay += thisData.amount
                    break
            }
            tm.repay.total += thisData.repayAmount ?? 0
            switch (thisData.repayMethod) {
                case '现金':
                    tm.repay.cash += thisData.repayAmount ?? 0
                    break
                case '返卡':
                    tm.repay.card += thisData.repayAmount ?? 0
                    break
                case '微信':
                    tm.repay.wechat += thisData.repayAmount ?? 0
                    break
                case '支付宝':
                    tm.repay.alipay += thisData.repayAmount ?? 0
                    break
                case '其他':
                    tm.repay.other += thisData.repayAmount ?? 0
                    break
            }
        }
        setTotalAmount(tm)
    }



    const getExportData = () => {
        var sheetHeader: string[] = []
        const data:{[key:string]:any} = JSON.parse(localStorage.getItem('pageData') ?? '[]')
        var sheetData: any[] = []
        var sheetFilter: any[] = []
        if (localStorage.getItem('needRepay') === 'true') {
            sheetHeader = ["序号", "姓名", "收礼金额大写", "收礼金额", "收礼方式", "返礼金额/数量大写", "返礼金额/数量", "返礼方式", "收礼方", "备注"]
            sheetFilter = ["id", "name", "amountChinese", "amount", "paymentMethod", "repayAmountChinese", "repayAmount", "repayMethod", "platform", "remark"]
            for (const key in data) {
                let tempData = data[key]
                tempData.amountChinese = digitUppercase(tempData.amount ?? 0)
                tempData.repayAmountChinese = digitUppercase(tempData.repayAmount ?? 0)
                if (tempData.repayMethod === '返卡') {
                    tempData.repayAmountChinese = tempData.repayAmountChinese.replaceAll("元整","张")
                }
                sheetData.push(tempData)
            }
        } else {
            sheetHeader = ["序号", "姓名", "收礼金额大写", "收礼金额", "收礼方式", "收礼方", "备注"]
            sheetFilter = ["id", "name", "amountChinese", "amount", "paymentMethod", "platform", "remark"]
            for (const key in data) {
                let tempData = data[key]
                tempData.amountChinese = digitUppercase(tempData.amount ?? 0)
                delete tempData.repayAmount
                delete tempData.repayMethod
                sheetData.push(tempData)
            }
        }
        return [sheetHeader,sheetFilter,sheetData]
    }

    const editRow = (e: any) => {
        let {id} = e.currentTarget.dataset;
        id = parseInt(id)
        if (!editableId.includes(id)) {
            setEditableId(editableId.concat(parseInt(id)))
        }
    }
    const saveRow = (e: any) => {
        let {id} = e.currentTarget.dataset;
        id = parseInt(id)
        const dataIndex = pageData.findIndex((t) => t.id === id);
        const newData = dataChangeTemp[id] ?? pageData[dataIndex]
        // @ts-ignore
        newData.amount = parseInt(newData.amount)
        // @ts-ignore
        newData.repayAmount = parseInt(newData.repayAmount)
        pageData[dataIndex] = newData
        setLocalstorageItem('pageData', JSON.stringify(pageData))
        cancelEdit({currentTarget: {dataset: {id}}})
        NotificationPlugin.success({
            title: '成功',
            content: '修改成功',
        })
    }
    const cancelEdit = (e: any) => {
        let {id} = e.currentTarget.dataset;
        id = parseInt(id)
        const index = editableId.findIndex((t) => t === id);
        editableId.splice(index, 1);
        setEditableId([...editableId]);
    }
    const onRowEdit = (param: any) => {
        const dataIndex = pageData.findIndex((t) => t.id === param.row.id);
        let data = dataChangeTemp[param.editedRow.id] ?? pageData[dataIndex]
        // @ts-ignore
        data[param.col.colKey] = param.editedRow[param.col.colKey]
        dataChangeTemp[param.editedRow.id] = data

        setDataChangeTemp(dataChangeTemp)
    }

    return (
        <>
            <Card
                header="统计数据"
            >
                <div>
                    <span>收款信息</span>
                    <span className="money-display">总金额:<span
                        className="money-number"> {digitUppercase(totalAmount.collect.total)}(￥{totalAmount.collect.total})</span></span>
                    <span className="money-display">现金:<span
                        className="money-number"> {digitUppercase(totalAmount.collect.cash)}(￥{totalAmount.collect.cash})</span></span>
                    <span className="money-display">微信:<span
                        className="money-number"> {digitUppercase(totalAmount.collect.wechat)}(￥{totalAmount.collect.wechat})</span></span>
                    <span className="money-display">支付宝:<span
                        className="money-number"> {digitUppercase(totalAmount.collect.alipay)}(￥{totalAmount.collect.alipay})</span></span>
                    <span className="money-display">其他:<span
                        className="money-number"> {digitUppercase(totalAmount.collect.other)}(￥{totalAmount.collect.other})</span></span>
                </div>
                {needRepay && <div>
                    <span>返礼信息</span>
                    <span className="money-display">总金额:<span
                        className="money-number"> {digitUppercase(totalAmount.repay.total)}(￥{totalAmount.repay.total})</span></span>
                    <span className="money-display">返卡:<span
                        className="money-number"> {digitUppercase(totalAmount.repay.card).replaceAll('元整','张')}({totalAmount.repay.card})</span></span>
                    <span className="money-display">微信:<span
                        className="money-number"> {digitUppercase(totalAmount.repay.wechat)}(￥{totalAmount.repay.wechat})</span></span>
                    <span className="money-display">支付宝:<span
                        className="money-number"> {digitUppercase(totalAmount.repay.alipay)}(￥{totalAmount.repay.alipay})</span></span>
                    <span className="money-display">现金:<span
                        className="money-number"> {digitUppercase(pageTotalAmount.repay.cash)}(￥{pageTotalAmount.repay.cash})</span></span>
                    <span className="money-display">其他:<span
                        className="money-number"> {digitUppercase(totalAmount.repay.other)}(￥{totalAmount.repay.other})</span></span>
                    <div>
                        <span>结余信息</span>
                        <span className="money-display">微信:<span
                            className="money-number"> {digitUppercase(totalAmount.collect.wechat - totalAmount.repay.wechat)}(￥{totalAmount.collect.wechat -totalAmount.repay.wechat})</span></span>
                        <span className="money-display">支付宝:<span
                            className="money-number"> {digitUppercase(totalAmount.collect.alipay -totalAmount.repay.alipay)}(￥{totalAmount.collect.alipay -totalAmount.repay.alipay})</span></span>
                        <span className="money-display">现金:<span
                            className="money-number"> {digitUppercase(totalAmount.collect.cash -pageTotalAmount.repay.cash)}(￥{totalAmount.collect.cash -pageTotalAmount.repay.cash})</span></span>
                    </div>
                </div>}
            </Card>
            <Table
                displayColumns={displayColumns}
                footerSummary={
                    <>
                        <span>当前页总记录数：<span className="money-number">{pageUserCount}</span></span>
                        <div>
                            <span>当前页收款信息</span>
                            <span className="money-display">总金额:<span
                                className="money-number"> {digitUppercase(pageTotalAmount.collect.total)}(￥{pageTotalAmount.collect.total})</span></span>
                            <span className="money-display">现金:<span
                                className="money-number"> {digitUppercase(pageTotalAmount.collect.cash)}(￥{pageTotalAmount.collect.cash})</span></span>
                            <span className="money-display">微信:<span
                                className="money-number"> {digitUppercase(pageTotalAmount.collect.wechat)}(￥{pageTotalAmount.collect.wechat})</span></span>
                            <span className="money-display">支付宝:<span
                                className="money-number"> {digitUppercase(pageTotalAmount.collect.alipay)}(￥{pageTotalAmount.collect.alipay})</span></span>
                            <span className="money-display">其他:<span
                                className="money-number"> {digitUppercase(pageTotalAmount.collect.other)}(￥{pageTotalAmount.collect.other})</span></span>
                        </div>
                        {needRepay && <div>
                            <span>当前页返礼信息</span>
                            <span className="money-display">总金额:<span
                                className="money-number"> {digitUppercase(pageTotalAmount.repay.total)}(￥{pageTotalAmount.repay.total})</span></span>
                            <span className="money-display">返卡:<span
                                className="money-number"> {digitUppercase(pageTotalAmount.repay.card).replaceAll('元整','张')}({pageTotalAmount.repay.card})</span></span>
                            <span className="money-display">微信:<span
                                className="money-number"> {digitUppercase(pageTotalAmount.repay.wechat)}(￥{pageTotalAmount.repay.wechat})</span></span>
                            <span className="money-display">支付宝:<span
                                className="money-number"> {digitUppercase(pageTotalAmount.repay.alipay)}(￥{pageTotalAmount.repay.alipay})</span></span>
                            <span className="money-display">现金:<span
                                className="money-number"> {digitUppercase(pageTotalAmount.repay.cash)}(￥{pageTotalAmount.repay.cash})</span></span>
                            <span className="money-display">其他:<span
                                className="money-number"> {digitUppercase(pageTotalAmount.repay.other)}(￥{pageTotalAmount.repay.other})</span></span>
                        </div>}
                    </>}
                editableRowKeys={editableId}
                onRowEdit={onRowEdit}
                pagination={{
                    current: pageInfo.page,
                    pageSize: pageInfo.size,
                    showJumper: true,
                    total: pageInfo.total,
                    onChange: (pageDetail) => {
                        setPageInfo({...pageInfo, page: pageDetail.current, size: pageDetail.pageSize})
                    },
                    totalContent: (<>
                        <span>共 <span className="money-number"> {pageInfo.total}</span> 条数据</span>
                    </>)
                }}
                data={pageData}
                rowKey="id"
                columns={columns}
            />
        </>
    )
}

export default DataTable;