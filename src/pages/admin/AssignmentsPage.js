import { useState, useEffect } from "react";
import axios from "../../api/axiosInstance";
import Navbar from "../../components/Navbar";
import { Tag, Collapse, Table, List, Typography } from "antd";

const { Panel } = Collapse;
const { Title, Text } = Typography;

const AssignmentsPage = () => {
  const [groupedData, setGroupedData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activePanels, setActivePanels] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await axios.get("/admin/assignments");
      // Transform the data to group by user → project → chapter
      const userGroups = transformData(response.data);
      setGroupedData(userGroups);
    } catch (err) {
      setError("Failed to fetch assignments data");
    } finally {
      setLoading(false);
    }
  };

  // Transform the data to group by user → project → chapter
  const transformData = (apiData) => {
    const usersMap = {};

    apiData.forEach((userGroup) => {
      const userKey = userGroup.annotator;

      // Initialize user if not exists
      if (!usersMap[userKey]) {
        usersMap[userKey] = {
          userName: userGroup.annotator,
          userId: userGroup.details.annotator_id,
          projects: {},
        };
      }

      // Process each assignment for this user
      userGroup.details.assignments.forEach((assignment) => {
        // Initialize project if not exists
        if (!usersMap[userKey].projects[assignment.project_title]) {
          usersMap[userKey].projects[assignment.project_title] = {
            projectTitle: assignment.project_title,
            chapters: {},
          };
        }

        // Initialize chapter if not exists
        if (
          !usersMap[userKey].projects[assignment.project_title].chapters[
            assignment.chapter_title
          ]
        ) {
          usersMap[userKey].projects[assignment.project_title].chapters[
            assignment.chapter_title
          ] = {
            chapterTitle: assignment.chapter_title,
            assignments: [],
          };
        }

        // Add assignment to chapter
        usersMap[userKey].projects[assignment.project_title].chapters[
          assignment.chapter_title
        ].assignments.push(assignment);
      });
    });

    // Convert the map to an array structure
    return Object.values(usersMap).map((user) => ({
      ...user,
      projects: Object.values(user.projects).map((project) => ({
        ...project,
        chapters: Object.values(project.chapters),
      })),
    }));
  };

  const getStatusTag = (status) => {
    let color = "blue";
    if (status === "Completed") color = "green";
    if (status === "In Progress") color = "orange";
    if (status === "Rejected") color = "red";

    return <Tag color={color}>{status}</Tag>;
  };

  const getSectionTags = (assignment) => {
    return (
      <>
        {assignment.assign_lexical && <Tag color="blue">Lexical</Tag>}
        {assignment.assign_dependency && <Tag color="green">Dependency</Tag>}
        {assignment.assign_discourse && <Tag color="orange">Discourse</Tag>}
        {assignment.assign_construction && (
          <Tag color="purple">Construction</Tag>
        )}
      </>
    );
  };

  const assignmentColumns = [
    {
      title: "Project",
      dataIndex: "project_title",
      key: "project_title",
      render: (text) => <Text strong>{text}</Text>,
    },
    {
      title: "Chapter",
      dataIndex: "chapter_title",
      key: "chapter_title",
    },
    {
      title: "Sentence ID",
      dataIndex: "sentence_identifier",
      key: "sentence_identifier",
    },
    {
      title: "Segment ID",
      dataIndex: "segment_identifier",
      key: "segment_identifier",
    },
    {
      title: "Status",
      dataIndex: "annotation_status",
      key: "status",
      render: (status) => getStatusTag(status),
    },
    {
      title: "Sections",
      key: "sections",
      render: (_, assignment) => getSectionTags(assignment),
    },
  ];

  if (loading) return <div>Loading assignments...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
      <Navbar />
      <div style={{ marginBottom: "30px" }}>
        <Title level={2}>Assignment Management</Title>
        <p>View assignments organized by User → Project → Chapter</p>
      </div>

      <Collapse
        accordion
        activeKey={activePanels}
        onChange={(keys) => setActivePanels(keys)}
      >
        {groupedData.map((user, userIndex) => (
          <Panel
            header={
              <Title level={4} style={{ margin: 0 }}>
                {user.userName}
              </Title>
            }
            key={`user-${user.userId}`}
            extra={
              <div>
                <Tag>{Object.keys(user.projects).length} projects</Tag>
                <Tag>
                  {user.projects.reduce(
                    (total, project) => total + project.chapters.length,
                    0
                  )}{" "}
                  chapters
                </Tag>
                <Tag>
                  {user.projects.reduce(
                    (total, project) =>
                      total +
                      project.chapters.reduce(
                        (chapTotal, chapter) =>
                          chapTotal + chapter.assignments.length,
                        0
                      ),
                    0
                  )}{" "}
                  assignments
                </Tag>
              </div>
            }
          >
            <Collapse accordion>
              {user.projects.map((project, projectIndex) => (
                <Panel
                  header={
                    <Title level={5} style={{ margin: 0 }}>
                      {project.projectTitle}
                    </Title>
                  }
                  key={`project-${user.userId}-${projectIndex}`}
                  extra={
                    <div>
                      <Tag>{project.chapters.length} chapters</Tag>
                      <Tag>
                        {project.chapters.reduce(
                          (total, chapter) =>
                            total + chapter.assignments.length,
                          0
                        )}{" "}
                        assignments
                      </Tag>
                    </div>
                  }
                >
                  <List
                    itemLayout="vertical"
                    dataSource={project.chapters}
                    renderItem={(chapter, chapterIndex) => (
                      <List.Item
                        key={`chapter-${user.userId}-${projectIndex}-${chapterIndex}`}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            marginBottom: 8,
                          }}
                        >
                          <Title level={5}>{chapter.chapterTitle}</Title>
                          <Tag>{chapter.assignments.length} assignments</Tag>
                        </div>
                        <Table
                          columns={assignmentColumns}
                          dataSource={chapter.assignments}
                          rowKey="id"
                          pagination={false}
                          bordered
                          size="small"
                          style={{ marginTop: 8 }}
                        />
                      </List.Item>
                    )}
                  />
                </Panel>
              ))}
            </Collapse>
          </Panel>
        ))}
      </Collapse>
    </div>
  );
};

export default AssignmentsPage;
