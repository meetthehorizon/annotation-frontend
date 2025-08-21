import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  message,
  Card,
  Divider,
  Tabs,
  InputNumber,
  Tag,
} from "antd";
import axiosInstance from "../api/axiosInstance";
import { useAuth } from "../authContext";

const { Option } = Select;
const { TextArea } = Input;

const WideSelect = (props) => (
  <Select
    {...props}
    style={{ width: "100%", minWidth: "200px" }}
    popupMatchSelectWidth={false}
    styles={{
      popup: {
        root: { minWidth: "100px" },
      },
    }}
  >
    {props.children}
  </Select>
);

const AnnotatorDashboard = () => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUsr, setSelectedUsr] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("lexical");
  const [form] = Form.useForm();
  const { token } = useAuth();
  const [visualizationModalOpen, setVisualizationModalOpen] = useState(false);
  const [visualizationUrl, setVisualizationUrl] = useState("");
  const [usrLanguage, setUsrLanguage] = useState("hindi");
  const [permissions, setPermissions] = useState({
    lexical: true,
    dependency: true,
    discourse: true,
    construction: true,
  });

  // Define all dropdown options
  const semanticCategories = [
    "-",
    "anim",
    "calendricunit",
    "clocktime",
    "dom",
    "dow",
    "era",
    "female",
    "male",
    "meas",
    "moy",
    "ne",
    "numex",
    "org",
    "per/female",
    "per/male",
    "per",
    "place",
    "season",
    "timex",
    "yoc",
  ];

  const morphologicalSemantics = [
    "-",
    "causative",
    "comperless",
    "compermore",
    "doublecausative",
    "dvitva",
    "kqw",
    "mawup",
    "pl",
    "superl",
    "mawup/pl",
    "xviwva",
    "xviwva/pl",
  ];

  const speakersViews = [
    "-",
    "hI_1",
    "hI_2",
    "hI_3",
    "hI_4",
    "hI_5",
    "hI_6",
    "BI_1",
    "BI_2",
    "BI_3",
    "BI_4",
    "BI_5",
    "wo_1",
    "wo_2",
    "wo_3",
    "wo_4",
    "waka_1",
    "waka_2",
    "mAwra_1",
    "mAwra_2",
    "mAwra_3",
    "kevala_1",
    "sI_1",
    "kariba_1",
    "[shade:jA_1]",
    "[shade:jA_2]",
    "[shade:dAla_1]",
    "[shade:dAla_2]",
    "[shade:pA_1]",
    "[shade:xe_1]",
    "[shade:le_1]",
    "[shade:uTa_1]",
    "[shade:bETa_1]",
    "[shade:Cala_1]",
    "[shade:laga_1]",
    "[shade:mara_1]",
    "[shade:A_1]",
    "[shade:bana_1]",
    "def",
    "proximal",
    "distal",
    "respect",
    "informal",
    "ki_1",
    "sIrPa_1",
    "sA_1",
    "sA_2",
    "sA_3",
    "sA_4",
    "lagaBaga_1",
    "nA_1",
    "nA_2",
    "nA_3",
    "nA_4",
    "basa_1",
    "basa_2",
    "basa_3",
    "karIba_1",
    "karIba_2",
    "TIka_1",
    "TIka_2",
    "TIka_3",
    "TIka_4",
  ];

  const componentTypes = [
    "component1",
    "component2",
    "component3",
    "component4",
    "component5",
    "component6",
    "count",
    "end",
    "head",
    "kriyAmUla",
    "mod",
    "op1",
    "op2",
    "op3",
    "op4",
    "op5",
    "op6",
    "op7",
    "op8",
    "op9",
    "op10",
    "part",
    "start",
    "unit",
    "unit_value",
    "unit_every",
    "verbalizer",
    "whole",
    "begin",
    "avayavI",
    "avayava",
    "inside",
    "-",
  ];

  const relationTypes = [
    "-",
    "card",
    "dem",
    "dur",
    "extent",
    "freq",
    "intf",
    "jk1",
    "k1",
    "k1as",
    "k1s",
    "k2",
    "k2g",
    "k2p",
    "k2s",
    "k2as",
    "k3",
    "k3as",
    "k4",
    "k4a",
    "k4as",
    "k5",
    "k5as",
    "k5prk",
    "k7",
    "k7a",
    "k7as",
    "k7p",
    "k7t",
    "krvn",
    "krvnneg",
    "main",
    "mk1",
    "mod",
    "neg",
    "ord",
    "pk1",
    "quant",
    "quantless",
    "quantmore",
    "rad",
    "rask1",
    "rask2",
    "rask3",
    "rask4",
    "rask5",
    "rask7",
    "rasnegk1",
    "rasnegk2",
    "rbks",
    "rblak",
    "rblpk",
    "rblsk",
    "rcdelim",
    "rcelab",
    "rcloc",
    "rcprop",
    "rcsamAnakAla",
    "rd",
    "rdl",
    "re",
    "rh",
    "rhh",
    "rk",
    "rkl",
    "rmeas",
    "rn",
    "rp",
    "rprop",
    "r6",
    "rpk",
    "rs",
    "rsma",
    "rsm",
    "rsk",
    "rt",
    "ru",
    "rv",
    "rvks",
    "rviroXIk1",
    "rviroXIk2",
    "vIpsA",
    "vkvn",
  ];

  const discourserel = [
    "-",
    "coref",
    "AvaSyakawApariNAma",
    "AvaSyakawApariNAma.nahIM",
    "anyawra",
    "arWAwa",
    "kAryakAraNa",
    "kAryaxyowaka",
    "kqw",
    "meas",
    "samuccaya",
    "samuccaya.BI",
    "samuccaya.alAvA",
    "samuccaya.awirikwa",
    "samuccaya.samAveSI",
    "span_1",
    "span_2",
    "uXAharaNasvarUpa",
    "viroXi",
    "viroXaxyotaka",
    "vyABicAra",
    "vyaBicAra",
  ];

  const constructionOptions = [
    "-",
    "[2-bahubrIhi]",
    "[2-waw]",
    "[3-bahubrIhi]",
    "[3-waw]",
    "[4-bahubrIhi]",
    "[4-waw]",
    "[5-bahubrIhi]",
    "[5-waw]",
    "[6-bahubrIhi]",
    "[6-waw]",
    "[7-bahubrIhi]",
    "[7-waw]",
    "[avyayIBAva]",
    "[cp_1]",
    "[cp_2]",
    "[cp_3]",
    "[compound_1]",
    "[compound_2]",
    "[compound_3]",
    "[conj_1]",
    "[conj_2]",
    "[conj_3]",
    "[disjunct_1]",
    "[disjunct_2]",
    "[disjunct_3]",
    "[karmaXAraya]",
    "[maXyamapaxalopI]",
    "[meas_1]",
    "[meas_2]",
    "[op1]",
    "[op2]",
    "[span_1]",
    "[span_2]",
    "[xvanxva]",
    "[xvigu]",
    "[upapaxa]",
  ];

  useEffect(() => {
    if (!token) return;

    const fetchAssignments = async () => {
      try {
        const response = await axiosInstance.get("/annotator/dashboard");
        setAssignments(response.data);
        setLoading(false);
      } catch (error) {
        message.error("Failed to fetch assignments");
        setLoading(false);
      }
    };

    fetchAssignments();
  }, [token]);

  const searchConcepts = async (term) => {
    const baseTerm = term.replace(/_\d+$/, ""); // Remove numeric suffix
    const response = await axiosInstance.get("/annotator/search_concepts", {
      params: {
        term: baseTerm,
        lang: usrLanguage,
        exact: false,
      },
    });
    return response.data.results;
  };

  const handleEdit = async (usrId) => {
    try {
      const response = await axiosInstance.get(`/annotator/usr/${usrId}`);
      setSelectedUsr(response.data);
      setUsrLanguage(response.data.usr.language || "hindi");

      // Set permissions from the assignment
      const assignmentPermissions = response.data.permissions || {};
      setPermissions({
        lexical: assignmentPermissions.assign_lexical || false,
        dependency: assignmentPermissions.assign_dependency || false,
        discourse: assignmentPermissions.assign_discourse || false,
        construction: assignmentPermissions.assign_construction || false,
      });

      const usr = response.data.usr;

      // Only load data for sections the user has permission to edit
      const lexicalInfo = assignmentPermissions.assign_lexical
        ? (usr.lexical_info || []).map((li) => ({
            id: li.id,
            concept: li.concept || "",
            index: li.index || 0,
            semantic_category: li.semantic_category || "",
            morpho_semantic: li.morpho_semantic || "",
            speakers_view: li.speakers_view || "",
          }))
        : [];

      const dependencyInfo = assignmentPermissions.assign_dependency
        ? (usr.dependency_info || []).map((di) => ({
            id: di.id,
            concept: di.concept || "",
            index: di.index || 0,
            head_index: di.head_index || "",
            relation: di.relation || "",
          }))
        : [];

      const discourseCorefInfo = assignmentPermissions.assign_discourse
        ? (usr.discourse_coref_info || []).map((dci) => ({
            id: dci.id,
            concept: dci.concept || "",
            index: dci.index || 0,
            head_index: dci.head_index || "",
            relation: dci.relation || "",
          }))
        : [];

      const constructionInfo = assignmentPermissions.assign_construction
        ? (usr.construction_info || []).map((ci) => ({
            id: ci.id,
            concept: ci.concept || "",
            index: ci.index || 0,
            cxn_index: ci.cxn_index || "",
            component_type: ci.component_type || "",
          }))
        : [];

      // Populate form fields
      form.setFieldsValue({
        sentence_type: usr.sentence_type,
        lexical_info: lexicalInfo,
        dependency_info: dependencyInfo,
        discourse_coref_info: discourseCorefInfo,
        construction_info: constructionInfo,
        sentence_type_info: usr.sentence_type_info || {},
      });

      setEditModalOpen(true);
    } catch (error) {
      message.error("Failed to load USR data");
      console.error("handleEdit error:", error);
    }
  };

  const ConceptSelect = ({ value, onChange, disabled, onBlur }) => {
    const [options, setOptions] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
      if (value) {
        fetchOptions(value);
      }
    }, [value]);

    const fetchOptions = async (term) => {
      setLoading(true);
      try {
        const results = await searchConcepts(term);
        const formattedOptions = results.map((item) => ({
          value: item.concept_label,
          label: `${item.hindi_label || item.concept_label}${
            item.english_label ? ` (${item.english_label})` : ""
          }`,
        }));
        setOptions(formattedOptions);
      } catch (error) {
        console.error("Search error:", error);
        setOptions([]);
      } finally {
        setLoading(false);
      }
    };

    const handleSearch = async (term) => {
      if (term) {
        await fetchOptions(term);
      }
    };

    return (
      <Select
        showSearch
        value={value}
        placeholder="Search concept..."
        defaultActiveFirstOption={false}
        filterOption={false}
        onSearch={handleSearch}
        onChange={onChange}
        onBlur={onBlur}
        notFoundContent={loading ? "Searching..." : "No concepts found"}
        options={options}
        disabled={disabled}
        style={{ width: "100%" }}
        onFocus={() => {
          if (value && options.length === 0) {
            fetchOptions(value);
          }
        }}
      />
    );
  };

  const handleConceptChange = (name, newConcept, fieldName) => {
    const currentValues = form.getFieldsValue();

    const currentLexicalItem = currentValues.lexical_info[name];
    if (!currentLexicalItem) return;

    [
      "lexical_info",
      "dependency_info",
      "discourse_coref_info",
      "construction_info",
    ].forEach((tab) => {
      const tabData = currentValues[tab] || [];
      const itemIndex = tabData.findIndex(
        (item) => item?.id === currentLexicalItem.id
      );

      if (itemIndex >= 0) {
        const newTabData = [...tabData];
        newTabData[itemIndex] = {
          ...newTabData[itemIndex],
          concept: newConcept,
        };
        form.setFieldsValue({
          [tab]: newTabData,
        });
      }
    });
  };

  const handleAddLexicalItem = () => {
    if (!permissions.lexical) return;

    const lexicalFields = form.getFieldValue("lexical_info") || [];
    const dependencyFields = form.getFieldValue("dependency_info") || [];
    const discourseFields = form.getFieldValue("discourse_coref_info") || [];
    const constructionFields = form.getFieldValue("construction_info") || [];

    const allIndexes = [
      ...lexicalFields.map((item) => item.index || 0),
      ...dependencyFields.map((item) => item.index || 0),
      ...discourseFields.map((item) => item.index || 0),
      ...constructionFields.map((item) => item.index || 0),
    ];
    const nextIndex = allIndexes.length > 0 ? Math.max(...allIndexes) + 1 : 1;

    const newId = `new-${Math.random().toString(36).substr(2, 9)}`;

    const newLexicalItem = {
      id: newId,
      concept: "",
      index: nextIndex,
      semantic_category: "",
      morpho_semantic: "",
      speakers_view: "",
    };

    const newDependencyItem = {
      id: newId,
      concept: "",
      index: nextIndex,
      head_index: null,
      relation: "",
    };

    const newDiscourseItem = {
      id: newId,
      concept: "",
      index: nextIndex,
      head_index: null,
      relation: "",
    };

    const newConstructionItem = {
      id: newId,
      concept: "",
      index: nextIndex,
      cxn_index: null,
      component_type: "",
    };

    form.setFieldsValue({
      lexical_info: [...lexicalFields, newLexicalItem],
      dependency_info: [...dependencyFields, newDependencyItem],
      discourse_coref_info: [...discourseFields, newDiscourseItem],
      construction_info: [...constructionFields, newConstructionItem],
    });
  };

  const handleRemoveLexicalItem = (name) => {
    if (!permissions.lexical) return;

    const lexicalFields = form.getFieldValue("lexical_info") || [];
    const dependencyFields = form.getFieldValue("dependency_info") || [];
    const discourseFields = form.getFieldValue("discourse_coref_info") || [];
    const constructionFields = form.getFieldValue("construction_info") || [];

    const itemToRemove = lexicalFields[name];
    if (!itemToRemove) return;

    const conceptToRemove = itemToRemove.concept;

    const newLexical = lexicalFields.filter((item, i) => i !== name);
    const newDependency = dependencyFields.filter(
      (item) => item.concept !== conceptToRemove
    );
    const newDiscourse = discourseFields.filter(
      (item) => item.concept !== conceptToRemove
    );
    const newConstruction = constructionFields.filter(
      (item) => item.concept !== conceptToRemove
    );

    form.setFieldsValue({
      lexical_info: newLexical,
      dependency_info: newDependency,
      discourse_coref_info: newDiscourse,
      construction_info: newConstruction,
    });
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();

      const payload = {
        sentence_type: values.sentence_type,
        lexical_info: permissions.lexical
          ? (values.lexical_info || []).map((item) => ({
              ...item,
              index: item.index || 0,
              semantic_category: item.semantic_category || "",
              morpho_semantic: item.morpho_semantic || "",
              speakers_view: item.speakers_view || "",
            }))
          : [],
        dependency_info: permissions.dependency
          ? (values.dependency_info || []).map((item) => ({
              ...item,
              index: item.index || 0,
              head_index: item.head_index || null,
              relation: item.relation || "",
            }))
          : [],
        discourse_coref_info: permissions.discourse
          ? (values.discourse_coref_info || []).map((item) => ({
              ...item,
              index: item.index || 0,
              head_index: item.head_index || null,
              relation: item.relation || "",
            }))
          : [],
        construction_info: permissions.construction
          ? (values.construction_info || []).map((item) => ({
              ...item,
              index: item.index || 0,
              cxn_index: item.cxn_index || null,
              component_type: item.component_type || "",
            }))
          : [],
        sentence_type_info: values.sentence_type_info || {},
      };

      await axiosInstance.put(`/annotator/usr/${selectedUsr.usr.id}`, payload);
      message.success("USR updated successfully");
      setEditModalOpen(false);
      const response = await axiosInstance.get("/annotator/dashboard");
      setAssignments(response.data);
    } catch (error) {
      message.error("Failed to update USR");
      console.error("Update error:", error);
    }
  };

  const handleSubmit = async (usrId) => {
    try {
      await axiosInstance.post(`/annotator/submit_usr/${usrId}`, {});
      message.success("USR submitted for review");
      const response = await axiosInstance.get("/annotator/dashboard");
      setAssignments(response.data);
    } catch (error) {
      message.error("Failed to submit USR");
    }
  };

  const handleVisualize = async (usrId) => {
    try {
      const response = await axiosInstance.get(
        `/annotator/visualize_usr/${usrId}`,
        {
          responseType: "blob",
        }
      );

      const imageUrl = URL.createObjectURL(response.data);
      setVisualizationUrl(imageUrl);
      setVisualizationModalOpen(true);
    } catch (error) {
      message.error("Failed to generate visualization");
    }
  };

  const renderSegmentInfo = () => (
    <Card title="Segment Information" style={{ marginBottom: 16 }}>
      <div style={{ marginBottom: 16 }}>
        <h4>Original Text</h4>
        <pre>{selectedUsr.segment.text}</pre>
        <h4>WX Text</h4>
        <pre>{selectedUsr.segment.wxtext}</pre>
        <h4>English Text</h4>
        <pre>{selectedUsr.segment.englishtext}</pre>
      </div>
      <Form.Item name="sentence_type" label="Sentence Type">
        <Select>
          <Option value="declarative">Declarative</Option>
          <Option value="interrogative">Interrogative</Option>
          <Option value="imperative">Imperative</Option>
          <Option value="affirmative">Affirmative</Option>
          <Option value="negative">Negative</Option>
        </Select>
      </Form.Item>
    </Card>
  );

  const isConstructionPattern = (concept) => {
    return concept && concept.startsWith("[") && concept.endsWith("]");
  };

  const tabItems = [
    {
      key: "lexical",
      label: "Lexical",
      disabled: !permissions.lexical,
      children: (
        <Form.List name="lexical_info">
          {(fields, { add, remove }) => (
            <>
              {permissions.lexical && (
                <Button
                  type="dashed"
                  onClick={handleAddLexicalItem}
                  style={{ marginBottom: 16 }}
                >
                  Add Lexical Item
                </Button>
              )}
              <Table
                dataSource={fields}
                rowKey="key"
                pagination={false}
                scroll={{ x: "max-content" }}
                columns={[
                  {
                    title: "Index",
                    dataIndex: "index",
                    key: "index",
                    width: 80,
                    render: (_, { name }) => {
                      const lexicalInfo =
                        form.getFieldValue("lexical_info") || [];
                      return (
                        <Form.Item name={[name, "index"]} noStyle>
                          <Input
                            type="number"
                            disabled
                            value={lexicalInfo[name]?.index}
                          />
                        </Form.Item>
                      );
                    },
                  },
                  {
                    title: "Concept",
                    dataIndex: "concept",
                    key: "concept",
                    width: 150,
                    render: (_, { name }) => {
                      const lexicalInfo =
                        form.getFieldValue("lexical_info") || [];
                      const concept = lexicalInfo[name]?.concept || "";

                      return (
                        <Form.Item
                          name={[name, "concept"]}
                          noStyle
                          rules={[
                            { required: true, message: "Concept is required" },
                          ]}
                        >
                          {isConstructionPattern(concept) ? (
                            <WideSelect disabled={!permissions.lexical}>
                              {constructionOptions.map((option) => (
                                <Option key={option} value={option}>
                                  {option}
                                </Option>
                              ))}
                            </WideSelect>
                          ) : (
                            <ConceptSelect
                              onChange={(newValue) =>
                                handleConceptChange(
                                  name,
                                  newValue,
                                  "lexical_info"
                                )
                              }
                              onBlur={() => {
                                form.validateFields([
                                  ["lexical_info", name, "concept"],
                                ]);
                              }}
                              disabled={!permissions.lexical}
                            />
                          )}
                        </Form.Item>
                      );
                    },
                  },
                  {
                    title: "Semantic Category",
                    dataIndex: "semantic_category",
                    key: "semantic_category",
                    width: 200,
                    render: (_, { name }) => (
                      <Form.Item name={[name, "semantic_category"]} noStyle>
                        <WideSelect disabled={!permissions.lexical}>
                          {semanticCategories.map((category) => (
                            <Option key={category} value={category}>
                              {category}
                            </Option>
                          ))}
                        </WideSelect>
                      </Form.Item>
                    ),
                  },
                  {
                    title: "Morpho-Semantic",
                    dataIndex: "morpho_semantic",
                    key: "morpho_semantic",
                    width: 200,
                    render: (_, { name }) => (
                      <Form.Item name={[name, "morpho_semantic"]} noStyle>
                        <WideSelect disabled={!permissions.lexical}>
                          {morphologicalSemantics.map((item) => (
                            <Option key={item} value={item}>
                              {item}
                            </Option>
                          ))}
                        </WideSelect>
                      </Form.Item>
                    ),
                  },
                  {
                    title: "Speaker View",
                    dataIndex: "speakers_view",
                    key: "speakers_view",
                    width: 200,
                    render: (_, { name }) => (
                      <Form.Item name={[name, "speakers_view"]} noStyle>
                        <WideSelect disabled={!permissions.lexical}>
                          {speakersViews.map((view) => (
                            <Option key={view} value={view}>
                              {view}
                            </Option>
                          ))}
                        </WideSelect>
                      </Form.Item>
                    ),
                  },
                  {
                    title: "Action",
                    key: "action",
                    width: 100,
                    fixed: "right",
                    render: (_, { name }) =>
                      permissions.lexical && (
                        <Button
                          type="link"
                          danger
                          onClick={() => handleRemoveLexicalItem(name)}
                        >
                          Remove
                        </Button>
                      ),
                  },
                ]}
              />
            </>
          )}
        </Form.List>
      ),
    },
    {
      key: "construction",
      label: "Construction",
      disabled: !permissions.construction,
      children: (
        <Form.List name="construction_info">
          {(fields, { add, remove }) => (
            <Table
              dataSource={fields}
              rowKey="key"
              pagination={false}
              scroll={{ x: "max-content" }}
              columns={[
                {
                  title: "Index",
                  dataIndex: "index",
                  key: "index",
                  width: 80,
                  render: (_, { name }) => {
                    const fieldValue = form.getFieldValue([
                      "construction_info",
                      name,
                    ]);
                    return (
                      <Form.Item name={[name, "index"]} noStyle>
                        <InputNumber
                          disabled
                          style={{ width: "100%" }}
                          value={fieldValue?.index}
                        />
                      </Form.Item>
                    );
                  },
                },
                {
                  title: "Concept",
                  dataIndex: "concept",
                  key: "concept",
                  width: 200,
                  render: (_, { name }) => {
                    const fieldValue = form.getFieldValue([
                      "construction_info",
                      name,
                    ]);
                    return (
                      <Form.Item name={[name, "concept"]} noStyle>
                        <Input
                          style={{ width: "100%" }}
                          value={fieldValue?.concept}
                          disabled={!permissions.construction}
                        />
                      </Form.Item>
                    );
                  },
                },
                {
                  title: "Cxn Index",
                  dataIndex: "cxn_index",
                  key: "cxn_index",
                  width: 120,
                  render: (_, { name }) => {
                    const fieldValue = form.getFieldValue([
                      "construction_info",
                      name,
                    ]);
                    return (
                      <Form.Item name={[name, "cxn_index"]} noStyle>
                        <InputNumber
                          style={{ width: "100%" }}
                          value={fieldValue?.cxn_index || null}
                          disabled={!permissions.construction}
                        />
                      </Form.Item>
                    );
                  },
                },
                {
                  title: "Component Type",
                  dataIndex: "component_type",
                  key: "component_type",
                  width: 200,
                  render: (_, { name }) => {
                    const fieldValue = form.getFieldValue([
                      "construction_info",
                      name,
                    ]);
                    return (
                      <Form.Item name={[name, "component_type"]} noStyle>
                        <WideSelect
                          style={{ width: "100%" }}
                          value={fieldValue?.component_type}
                          disabled={!permissions.construction}
                        >
                          {componentTypes.map((type) => (
                            <Option key={type} value={type}>
                              {type}
                            </Option>
                          ))}
                        </WideSelect>
                      </Form.Item>
                    );
                  },
                },
              ]}
            />
          )}
        </Form.List>
      ),
    },
    {
      key: "dependency",
      label: "Dependency",
      disabled: !permissions.dependency,
      children: (
        <Form.List name="dependency_info">
          {(fields, { add, remove }) => (
            <Table
              dataSource={fields}
              rowKey="key"
              pagination={false}
              scroll={{ x: "max-content" }}
              columns={[
                {
                  title: "Index",
                  dataIndex: "index",
                  key: "index",
                  width: 80,
                  render: (_, { name }) => {
                    const dependencyInfo =
                      form.getFieldValue("dependency_info") || [];
                    return (
                      <Form.Item name={[name, "index"]} noStyle>
                        <Input
                          type="number"
                          disabled
                          value={dependencyInfo[name]?.index}
                        />
                      </Form.Item>
                    );
                  },
                },
                {
                  title: "Concept",
                  dataIndex: "concept",
                  key: "concept",
                  width: 150,
                  render: (_, { name }) => (
                    <Form.Item name={[name, "concept"]} noStyle>
                      <Input disabled={!permissions.dependency} />
                    </Form.Item>
                  ),
                },
                {
                  title: "Head Index",
                  dataIndex: "head_index",
                  key: "head_index",
                  width: 120,
                  render: (_, { name }) => (
                    <Form.Item name={[name, "head_index"]} noStyle>
                      <Input type="number" disabled={!permissions.dependency} />
                    </Form.Item>
                  ),
                },
                {
                  title: "Relation",
                  dataIndex: "relation",
                  key: "relation",
                  width: 200,
                  render: (_, { name }) => (
                    <Form.Item name={[name, "relation"]} noStyle>
                      <WideSelect disabled={!permissions.dependency}>
                        {relationTypes.map((rel) => (
                          <Option key={rel} value={rel}>
                            {rel}
                          </Option>
                        ))}
                      </WideSelect>
                    </Form.Item>
                  ),
                },
              ]}
            />
          )}
        </Form.List>
      ),
    },
    {
      key: "discourse",
      label: "Discourse & Scope",
      disabled: !permissions.discourse,
      children: (
        <>
          <Form.List name="discourse_coref_info">
            {(fields, { add, remove }) => (
              <Table
                dataSource={fields}
                rowKey="key"
                pagination={false}
                scroll={{ x: "max-content" }}
                columns={[
                  {
                    title: "Index",
                    dataIndex: "index",
                    key: "index",
                    width: 80,
                    render: (_, { name }) => {
                      const discourseInfo =
                        form.getFieldValue("discourse_coref_info") || [];
                      return (
                        <Form.Item name={[name, "index"]} noStyle>
                          <Input
                            type="number"
                            disabled
                            value={discourseInfo[name]?.index}
                          />
                        </Form.Item>
                      );
                    },
                  },
                  {
                    title: "Concept",
                    dataIndex: "concept",
                    key: "concept",
                    width: 150,
                    render: (_, { name }) => (
                      <Form.Item name={[name, "concept"]} noStyle>
                        <Input disabled={!permissions.discourse} />
                      </Form.Item>
                    ),
                  },
                  {
                    title: "Head Index",
                    dataIndex: "head_index",
                    key: "head_index",
                    width: 120,
                    render: (_, { name }) => (
                      <Form.Item name={[name, "head_index"]} noStyle>
                        <Input
                          type="number"
                          disabled={!permissions.discourse}
                        />
                      </Form.Item>
                    ),
                  },
                  {
                    title: "Relation",
                    dataIndex: "relation",
                    key: "relation",
                    width: 200,
                    render: (_, { name }) => (
                      <Form.Item name={[name, "relation"]} noStyle>
                        <WideSelect disabled={!permissions.discourse}>
                          {discourserel.map((rel) => (
                            <Option key={rel} value={rel}>
                              {rel}
                            </Option>
                          ))}
                        </WideSelect>
                      </Form.Item>
                    ),
                  },
                ]}
              />
            )}
          </Form.List>

          <Divider />

          <h3>Scope</h3>
          <Form.Item
            name={["sentence_type_info", "scope"]}
            label="Sentence Scope"
          >
            <TextArea
              rows={4}
              style={{ width: "100%" }}
              disabled={!permissions.discourse}
            />
          </Form.Item>
        </>
      ),
    },
  ];

  const columns = [
    {
      title: "Project",
      dataIndex: "project_title",
      key: "project_title",
    },
    {
      title: "Chapter",
      dataIndex: "chapter_title",
      key: "chapter_title",
    },
    {
      title: "Sentence ID",
      dataIndex: "sentence_id",
      key: "sentence_id",
    },
    {
      title: "Segment Text",
      dataIndex: "segment_text",
      key: "segment_text",
      render: (text) => <span className="text-ellipsis">{text}</span>,
    },
    {
      title: "Sentence Type",
      dataIndex: "sentence_type",
      key: "sentence_type",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag
          color={
            status === "Submitted for Review"
              ? "blue"
              : status === "In Progress"
              ? "orange"
              : status === "Completed"
              ? "green"
              : "default"
          }
        >
          {status}
        </Tag>
      ),
    },
    {
      title: "Assigned Sections",
      key: "sections",
      render: (_, record) => {
        const sections = [];
        if (record.assign_lexical) sections.push("Lexical");
        if (record.assign_dependency) sections.push("Dependency");
        if (record.assign_discourse) sections.push("Discourse");
        if (record.assign_construction) sections.push("Construction");
        return sections.map((section) => <Tag key={section}>{section}</Tag>);
      },
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <>
          <Button type="link" onClick={() => handleEdit(record.usr_id)}>
            Edit
          </Button>
          <Button type="link" onClick={() => handleVisualize(record.usr_id)}>
            Visualize
          </Button>
          {record.status === "In Progress" && (
            <Button type="link" onClick={() => handleSubmit(record.usr_id)}>
              Submit
            </Button>
          )}
        </>
      ),
    },
  ];

  return (
    <div className="annotator-dashboard">
      <h2>Your Assignments</h2>
      <Table
        columns={columns}
        dataSource={assignments}
        rowKey="assignment_id"
        loading={loading}
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title="USR Visualization"
        open={visualizationModalOpen}
        width="80%"
        footer={null}
        onCancel={() => {
          setVisualizationModalOpen(false);
          if (visualizationUrl) {
            URL.revokeObjectURL(visualizationUrl);
          }
        }}
      >
        {visualizationUrl && (
          <div style={{ textAlign: "center" }}>
            <img
              src={visualizationUrl}
              alt="USR Dependency Graph"
              style={{ maxWidth: "100%", height: "auto" }}
            />
          </div>
        )}
      </Modal>

      <Modal
        title={`Edit USR - ${selectedUsr?.segment?.id}`}
        open={editModalOpen}
        width="90%"
        onCancel={() => setEditModalOpen(false)}
        onOk={handleSave}
      >
        {selectedUsr && editModalOpen && (
          <Form form={form} layout="vertical">
            {renderSegmentInfo()}

            <Tabs
              activeKey={activeTab}
              onChange={setActiveTab}
              items={tabItems}
            />
          </Form>
        )}
      </Modal>
    </div>
  );
};

export default AnnotatorDashboard;
