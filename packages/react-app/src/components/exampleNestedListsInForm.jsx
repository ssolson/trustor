<Card title="Test">
  <Form.List
    name="additionalGrantors"
    initialValues={{
      addresses1: [undefined],
    }}
  >
    {(fields, { add, remove }) => {
      return (
        <div>
          {fields.map((field, index) => (
            <>
              <Row gutter={8} key={index}>
                <Col span={8}>
                  <Form.Item
                    {...field}
                    name={[field.name, "name"]}
                    label="Name"
                    key={index}
                    rules={[{ required: true, message: "Missing Grantor name" }]}
                  >
                    <Input placeholder="Grantor Name" />
                  </Form.Item>
                </Col>

                <Col span={15}>
                  <Form.List name={[field.name, "addresses1"]}>
                    {(addresses, { add, remove }) => {
                      return (
                        <div>
                          {addresses.map(address => (
                            <Row gutter={8}>
                              <Col span={23}>
                                <Form.Item
                                  {...address}
                                  name={[address.name, "address"]}
                                  label="Address"
                                  rules={[{ required: true, message: "Missing Grantor Address" }]}
                                >
                                  <Input placeholder="Grantor Address" />
                                </Form.Item>
                              </Col>

                              <Col span={1}>
                                <MinusCircleOutlined
                                  onClick={() => {
                                    remove(address.name);
                                  }}
                                />
                              </Col>
                            </Row>
                          ))}

                          <Form.Item>
                            <Button
                              type="dashed"
                              onClick={() => {
                                add();
                              }}
                              block
                            >
                              <PlusCircleOutlined /> Add Address
                            </Button>
                          </Form.Item>
                        </div>
                      );
                    }}
                  </Form.List>
                </Col>
                <Col span={1}>
                  <MinusCircleOutlined
                    onClick={() => {
                      remove(field.name);
                    }}
                  />
                </Col>
              </Row>
            </>
          ))}

          <Form.Item>
            <Button
              type="dashed"
              onClick={() => {
                add();
              }}
              block
            >
              <PlusCircleOutlined /> Add Grantor
            </Button>
          </Form.Item>
        </div>
      );
    }}
  </Form.List>
</Card>;
