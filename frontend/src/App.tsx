import React, {useState} from 'react';
import './App.css';
import {Button, Collapse, DialogPlugin, Divider, NotificationPlugin, Popconfirm, Switch} from "tdesign-react";
import DataTable from "./table/DataTable";
import WriteData from "./write_data/WriteData";
import CollapsePanel from "tdesign-react/es/collapse/CollapsePanel";
// @ts-ignore
import ExportJsonExcel from "js-export-excel"
import moment from "moment";
import PDFDocument from "./pdf/PDF";
import {PDFDownloadLink} from "@react-pdf/renderer";
import ReactDOM from 'react-dom';
import {setLocalstorageItem} from "./common/utils";

function App() {
    const [needRepay, setNeedRepay] = useState(false)
    const [pdfDocument, setPdfDocument] = useState((<PDFDocument header={[]} filter={[]} data={[]}/>))
    const [exportData, setExportData] = useState([])


    window.addEventListener('storage', (event) => {
        switch (event.key) {
            case 'needRepay':
                if (event.newValue === 'true') {
                    setNeedRepay(true)
                } else {
                    setNeedRepay(false)
                }
                break;
            case 'exportData':
                setExportData(JSON.parse(event.newValue ?? '[]'))
        }
    })

    const changeNeedRepay = (value: boolean) => {
        setNeedRepay(value)
        setLocalstorageItem('needRepay', String(value))
    }

    const resetPlatform = () => {
        const resetDialog = DialogPlugin({
            header: '请确认',
            body: '点击确认将会删除所有已保存的收礼方(已存在的数据中的收礼方将被保留)！',
            onConfirm: () => {
                setLocalstorageItem('platformOption','[]');
                NotificationPlugin.success({
                    title: '成功',
                    content: '数据清空完成',
                })
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

    const exportExcel = () => {
        const [sheetHeader, sheetFilter, sheetData] = exportData
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

    const resetData = () => {
        const resetDialog = DialogPlugin({
            header: '请确认',
            body: '点击确认将会删除当前记录的所有数据！',
            onConfirm: () => {
                setLocalstorageItem('pageData','[]');
                NotificationPlugin.success({
                    title: '成功',
                    content: '数据清空完成',
                })
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
                    onClick={exportExcel}
                >导出数据</Button>
                <PDFDownloadLink document={<PDFDocument  data={exportData[2] ?? []} filter={exportData[1] ?? []} header={exportData[0] ?? []}/>}  fileName="礼金簿.pdf">
                    <Button
                        style={{marginLeft: '8px'}}
                    >导出礼金簿</Button>
                </PDFDownloadLink>
                <Divider align="center">礼金录入系统</Divider>
            </div>
            <Collapse>
                <CollapsePanel header="新增收费记录">
                    <WriteData/>
                </CollapsePanel>
            </Collapse>
            <DataTable />
            {/*<div id="draw"><PDFDocument  data={exportData[2] ?? []} filter={exportData[1] ?? []} header={exportData[0] ?? []}/></div>*/}
        </>
    );
}

export default App;
