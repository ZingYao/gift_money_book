import {Button, Card, Form, Input, Select, Space, Textarea} from "tdesign-react";
import FormItem from "tdesign-react/es/form/FormItem";
import { useState} from "react";
import {setLocalstorageItem} from "../common/utils";

const WriteData = () => {
    const [platformOption, setPlatformOption] = useState<{ label: string, value: string }[]>([])
    const [needRepay, setNeedRepay] = useState(false)
    const [form] = Form.useForm();


    window.addEventListener('storage',(event) => {
        switch(event.key) {
            case 'platformOption':
                setPlatformOption(JSON.parse(event.newValue ?? '[]'))
                break
            case 'needRepay':
                if (event.newValue === 'true') {
                    setNeedRepay(true)
                } else {
                    setNeedRepay(false)
                }
        }
    })


    const onSubmit = (e: any) => {
        const data = JSON.parse(localStorage.getItem('pageData') ?? '[]')
        e.fields.id = data.length + 1
        e.fields.amount = parseInt(e.fields.amount ?? 0)
        e.fields.repayAmount = parseInt(e.fields.repayAmount ?? 0)
        data.push(e.fields)
        setLocalstorageItem('pageData', JSON.stringify(data))
        form.reset();
    }

    const createPlatformOption = (value: any) => {
        for (let i = 0; i < platformOption.length; i++) {
            if (platformOption[i].label === value) {
                return
            }
        }
        setLocalstorageItem('platformOption', JSON.stringify(platformOption.concat([{value, label: value}])))
        setPlatformOption(platformOption.concat([{value, label: value}]))
    }
    return (<>
        <Card
            hoverShadow
            style={{width: '400px'}}
        >
            <Form
                form={form}
                onSubmit={onSubmit}
            >
                <FormItem
                    label="姓名"
                    name="name"
                >
                    <Input></Input>
                </FormItem>
                <FormItem
                    label="金额"
                    name="amount"
                >
                    <Input type="number"></Input>
                </FormItem>
                <FormItem
                    label="收礼方式"
                    name="paymentMethod"
                >
                    <Select
                        options={[
                            {label: '现金', value: '现金'},
                            {label: '微信', value: '微信'},
                            {label: '支付宝', value: '支付宝'},
                            {label: '其他', value: '其他'},
                        ]}
                    />
                </FormItem>
                {needRepay && (<>
                    <FormItem
                        label="返礼金额"
                        name="repayAmount"
                    >
                        <Input type="number"></Input>
                    </FormItem>
                    <FormItem
                        label="返礼方式"
                        name="repayMethod"
                    >
                        <Select
                            options={[
                                {label: '返卡', value: '返卡'},
                                {label: '微信', value: '微信'},
                                {label: '支付宝', value: '支付宝'},
                                {label: '现金', value: '现金'},
                                {label: '其他', value: '其他'},
                            ]}
                        />
                    </FormItem>
                </>)}
                <FormItem
                    label="收礼方"
                    name="platform"
                >
                    <Select
                        options={platformOption}
                        onCreate={createPlatformOption}
                        filterable
                        creatable
                    />
                </FormItem>
                <FormItem
                    label="备注信息"
                    name="remark"
                >
                    <Textarea
                        autosize={{minRows: 2, maxRows: 5}}
                    />
                </FormItem>
                <FormItem>
                    <Space>
                        <Button type="submit" theme="primary">保存</Button>
                        <Button type="reset">重置</Button>
                    </Space>
                </FormItem>
            </Form>
        </Card>
    </>);
}

export default WriteData