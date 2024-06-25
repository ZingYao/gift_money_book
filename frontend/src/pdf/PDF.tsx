import {Page, Document, View} from '@react-pdf/renderer'
import {Fragment} from "react";

const height = 200

const PDFDocument = ({header, filter, data}: { header: string[], filter: string[], data: any[] }) => {
    const pageNum = Math.ceil(data.length / 10)
    const headerHeight = header.join('').length / 2 * 9
    const getValueTrStyle = (key: string): any => {
        const valueHeight: { [key: string]: string } = {
            'id': '5mm',
            'name': '5mm',
            'amountChinese': '10mm',
            'amount': '5mm',
            'paymentMethod': '5mm',
            'repayAmountChinese': '10mm',
            'repayAmount': '5mm',
            'repayMethod': '5mm',
            'platform': '5mm',
            'remark': '100%',
        }
        return valueHeight[key] ? {height: valueHeight[key]} : null
    }
    return (
        <Document>
            {Array.from({length: pageNum}, (_, page) => (
                <Page
                    size="A4"
                    orientation="landscape"
                    key={page}
                >
                    <View key={page}>
                        <table className="pdf-table" style={{
                            marginLeft: '3mm',
                            marginRight: '3mm',
                            marginTop: '3mm',
                            borderCollapse:'collapse',
                            height: '200mm'
                        }}>
                            {filter.map((value, index) => {
                                return (
                                    <Fragment key={index}>
                                        <tr className="pdf-table table-header">
                                            {Array.from({length: 10}, (_, i) => (
                                                <td key={i}>{header[index]}</td>
                                            ))}
                                        </tr>
                                        <tr className="pdf-table table-content"
                                            style={getValueTrStyle(value)}>
                                            {Array.from({length: 10}, (_, i) => (
                                                <td key={i} className={value}>{data[page * 10 + i]?.[value]}</td>
                                            ))}
                                        </tr>
                                    </Fragment>
                                )
                            })}
                        </table>
                        <div style={{width: '297mm', textAlign: 'center'}}><span> 第 <span
                            className="money-number">{page + 1}</span> 页 </span></div>
                    </View>
                </Page>
            ))}
        </Document>
    )
}

export default PDFDocument;