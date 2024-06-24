import React, {useEffect, useState} from 'react';
import './App.css';
import {Button, Collapse, DialogPlugin, Divider, NotificationPlugin, Popconfirm, Switch} from "tdesign-react";
import DataTable from "./table/DataTable";
import WriteData from "./write_data/WriteData";
import CollapsePanel from "tdesign-react/es/collapse/CollapsePanel";
// @ts-ignore
import ExportJsonExcel from "js-export-excel"
import {digitUppercase} from "pixiu-number-toolkit";
import moment from "moment";
import PDFDocument from "./pdf/PDF";
import {PDFDownloadLink} from "@react-pdf/renderer";
import ReactDOM from 'react-dom';

function App() {
    const [flushTs, setFlushTs] = useState(0)
    const [needRepay, setNeedRepay] = useState(false)
    const [pdfDocument, setPdfDocument] = useState((<PDFDocument header={[]} filter={[]} data={[]}/>))

    useEffect(() => {
        // 设置是否需要返礼
        if (localStorage.getItem('needRepay') === 'true') {
            setNeedRepay(true)
        } else {
            setNeedRepay(false)
        }
    }, [])

    const changeNeedRepay = (value: boolean) => {
        setNeedRepay(value)
        localStorage.setItem('needRepay', String(value))
        setFlushTsNow()
    }

    const setFlushTsNow = () => {
        setFlushTs((new Date()).getTime())
    }

    const resetPlatform = () => {
        const resetDialog = DialogPlugin({
            header: '请确认',
            body: '点击确认将会删除所有已保存的收礼方(已存在的数据中的收礼方将被保留)！',
            onConfirm: () => {
                localStorage.removeItem('platformOption');
                NotificationPlugin.success({
                    title: '成功',
                    content: '数据清空完成',
                })
                setFlushTsNow()
                resetDialog.hide()
            },
            onCancel: () => {
                resetDialog.hide()
            },
            onClose: () => {
                resetDialog.hide()
            }
        })
    }

    const exportData = () => {
        var sheetHeader: string[] = []
        const data = JSON.parse(localStorage.getItem('pageData') ?? '[]')
        var sheetData: any[] = []
        var sheetFilter: any[] = []
        if (needRepay) {
            sheetHeader = ["序号", "姓名", "收礼金额大写", "收礼金额", "收礼方式", "返礼金额大写", "返礼金额", "返礼方式", "收礼方", "备注"]
            sheetFilter = ["id", "name", "amountChinese", "amount", "paymentMethod", "repayAmountChinese", "repayAmount", "repayMethod", "platform", "remark"]
            for (const key in data) {
                let tempData = data[key]
                tempData.amountChinese = digitUppercase(tempData.amount ?? 0)
                tempData.repayAmountChinese = digitUppercase(tempData.repayAmount ?? 0)
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
        const options = {
            fileName: `礼金导出信息${moment().format('YYYY-MM-DD-HH-mm-ss')}.xlsx`,
            datas: [
                {
                    sheetData,
                    sheetName: 'Sheet1',
                    sheetFilter,
                    sheetHeader
                }
            ]
        }
        console.log('options', options)
        const toExcel = new ExportJsonExcel(options);
        toExcel.saveExcel()
    }

    const exportBook = () => {
        var sheetHeader: string[] = []
        const data = JSON.parse(localStorage.getItem('pageData') ?? '[]')
        var sheetData: any[] = []
        var sheetFilter: any[] = []
        if (needRepay) {
            sheetHeader = ["序号", "姓名", "收礼金额大写", "收礼金额", "收礼方式", "返礼金额大写", "返礼金额", "返礼方式", "收礼方", "备注"]
            sheetFilter = ["id", "name", "amountChinese", "amount", "paymentMethod", "repayAmountChinese", "repayAmount", "repayMethod", "platform", "remark"]
            for (const key in data) {
                let tempData = data[key]
                tempData.amountChinese = digitUppercase(tempData.amount ?? 0)
                tempData.repayAmountChinese = digitUppercase(tempData.repayAmount ?? 0)
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
        setPdfDocument(<PDFDocument filter={sheetFilter} header={sheetHeader} data={sheetData}/>)
        ReactDOM.render(<PDFDocument filter={sheetFilter} header={sheetHeader} data={sheetData}/>,document.getElementById("draw"))
        console.log('pdfDocument',pdfDocument)
    }

    const resetData = () => {
        const resetDialog = DialogPlugin({
            header: '请确认',
            body: '点击确认将会删除当前记录的所有数据！',
            onConfirm: () => {
                localStorage.clear();
                NotificationPlugin.success({
                    title: '成功',
                    content: '数据清空完成',
                })
                setFlushTsNow()
                resetDialog.hide()
            },
            onCancel: () => {
                resetDialog.hide()
            },
            onClose: () => {
                resetDialog.hide()
            }
        })
    }
    return (
        <>
            <div style={{margin: '5px 5px'}}>
                <Popconfirm
                    onConfirm={resetData}
                    content='确认删除所有数据？'
                >
                    <Button>重置系统数据</Button>
                </Popconfirm>
                <Popconfirm
                    onConfirm={resetPlatform}
                    content='确认删除所有收礼方信息？'
                >
                    <Button
                        style={{marginLeft: '8px'}}
                    >清空收礼方数据</Button>
                </Popconfirm>
                <span style={{marginLeft: '8px', fontSize: 'large'}}>
                    是否开启返礼
                    <Switch
                        label={['开', '关']}
                        value={needRepay}
                        onChange={changeNeedRepay}
                        size="large"
                        style={{marginLeft: '3px'}}
                    ></Switch>
                </span>
                <Button
                    style={{marginLeft: '8px'}}
                    onClick={exportData}
                >导出数据</Button>
                <PDFDownloadLink document={pdfDocument} onClick={exportBook} fileName="礼金簿.pdf">
                    <Button
                        style={{marginLeft: '8px'}}
                    >导出礼金簿</Button>
                </PDFDownloadLink>
                <Divider align="center">礼金录入系统</Divider>
            </div>
            <Collapse>
                <CollapsePanel header="新增收费记录">
                    <WriteData setFlushTs={setFlushTsNow} ts={flushTs}/>
                </CollapsePanel>
            </Collapse>
            <DataTable ts={flushTs}/>
            <div id="draw" ></div>
        </>
    );
}

export default App;
