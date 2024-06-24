import {Page, Document, View} from '@react-pdf/renderer'
import {Fragment} from "react";

const PDFDocument = ({header,filter,data}:{header:string[],filter:string[],data:any[]}) => {
    return (
        <Document>
            <Page
                size="A4"
                orientation="landscape"
            >
                <View key="table">
                    <table className="pdf-table" style={{border:"2px solid darkgreen"}}>
                        {filter.map((value,index)=> {
                            return (
                                <Fragment key={index}>
                                    <tr className="pdf-table table-header">
                                    {Array.from({length: 10}, (_, i) => (
                                        <td key={i}>{header[index]}</td>
                                    ))}
                                    </tr>
                                    <tr className="pdf-table table-content"  style={{height:190/header.length + "mm"}}>
                                        {Array.from({length: 10}, (_, i) => (
                                            <td key={i} className={value}>{data[i]?.[value]}</td>
                                        ))}
                                    </tr>
                                </Fragment>
                            )
                        })}
                    </table>
                </View>
            </Page>
        </Document>
    )
}

export default PDFDocument;