import React from 'react';

function ResultPDF({ interpretation, counsellorNote, user }) {
  const styles = {
    container: {
      backgroundColor: '#ffffff',
      color: '#000000',
      padding: '40px',
      fontFamily: 'Arial, sans-serif',
      fontSize: '12px',
      lineHeight: '1.6',
      maxWidth: '800px',
      margin: '0 auto'
    },
    header: {
      borderBottom: '2px solid #000000',
      paddingBottom: '20px',
      marginBottom: '30px'
    },
    title: {
      fontSize: '24px',
      fontWeight: 'bold',
      color: '#000000',
      marginBottom: '10px'
    },
    subtitle: {
      fontSize: '14px',
      color: '#333333',
      marginBottom: '5px'
    },
    section: {
      marginBottom: '30px',
      pageBreakInside: 'avoid',
      breakInside: 'avoid'
    },
    sectionTitle: {
      fontSize: '18px',
      fontWeight: 'bold',
      color: '#000000',
      marginBottom: '15px',
      borderBottom: '1px solid #cccccc',
      paddingBottom: '8px'
    },
    scoreBox: {
      border: '1px solid #000000',
      padding: '20px',
      marginBottom: '20px',
      backgroundColor: '#ffffff'
    },
    scoreValue: {
      fontSize: '36px',
      fontWeight: 'bold',
      color: '#000000',
      textAlign: 'center',
      marginBottom: '10px'
    },
    scoreLabel: {
      fontSize: '14px',
      color: '#333333',
      textAlign: 'center'
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: '1fr',
      gap: '20px',
      marginBottom: '20px'
    },
    gridTwo: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '20px',
      marginBottom: '20px'
    },
    card: {
      border: '1px solid #cccccc',
      padding: '15px',
      backgroundColor: '#ffffff'
    },
    cardTitle: {
      fontSize: '16px',
      fontWeight: 'bold',
      color: '#000000',
      marginBottom: '10px'
    },
    list: {
      listStyle: 'disc',
      paddingLeft: '20px',
      marginTop: '10px'
    },
    listItem: {
      marginBottom: '8px',
      color: '#000000'
    },
    text: {
      color: '#000000',
      marginBottom: '10px'
    },
    bold: {
      fontWeight: 'bold',
      color: '#000000'
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse',
      marginBottom: '20px'
    },
    tableHeader: {
      backgroundColor: '#f5f5f5',
      border: '1px solid #000000',
      padding: '10px',
      textAlign: 'left',
      fontWeight: 'bold',
      color: '#000000'
    },
    tableCell: {
      border: '1px solid #cccccc',
      padding: '10px',
      color: '#000000'
    },
    noteBox: {
      border: '1px solid #000000',
      padding: '15px',
      backgroundColor: '#ffffff',
      marginTop: '10px'
    },
    disclaimer: {
      border: '1px solid #cccccc',
      padding: '15px',
      backgroundColor: '#f9f9f9',
      marginTop: '20px',
      fontSize: '11px',
      color: '#333333'
    },
    infoTable: {
      width: '100%',
      borderCollapse: 'collapse'
    },
    infoLabel: {
      padding: '8px 12px',
      borderBottom: '1px solid #e5e5e5',
      fontWeight: 'bold',
      color: '#000000',
      verticalAlign: 'top'
    },
    infoValue: {
      padding: '8px 12px',
      borderBottom: '1px solid #e5e5e5',
      color: '#000000'
    }
  };

  if (!interpretation) return null;

  return (
    <div id="result-pdf" style={{ ...styles.container, backgroundColor: '#ffffff', color: '#000000' }}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>Career Assessment Report</h1>
        <p style={styles.subtitle}>
          Date: {new Date().toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </p>
      </div>

      {/* Student Information Section */}
      {(user || (interpretation && interpretation.student)) && (
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Student Information</h2>
          <div style={styles.card}>
            <table style={styles.infoTable}>
              <tbody>
                {(user?.full_name || (interpretation?.student && interpretation.student.full_name)) && (
                  <tr>
                    <td style={{ ...styles.infoLabel, width: '150px' }}>Full Name:</td>
                    <td style={styles.infoValue}>
                      {user?.full_name || (interpretation?.student && interpretation.student.full_name) || 'Not provided'}
                    </td>
                  </tr>
                )}
                {(user?.mobile_number || (interpretation?.student && interpretation.student.mobile_number)) && (
                  <tr>
                    <td style={styles.infoLabel}>Mobile Number:</td>
                    <td style={styles.infoValue}>
                      {user?.mobile_number || (interpretation?.student && interpretation.student.mobile_number)}
                    </td>
                  </tr>
                )}
                {(user?.education || (interpretation?.student && interpretation.student.education)) && (
                  <tr>
                    <td style={styles.infoLabel}>Education:</td>
                    <td style={styles.infoValue}>
                      {user?.education || (interpretation?.student && interpretation.student.education)}
                    </td>
                  </tr>
                )}
                {(user?.email || (interpretation?.student && interpretation.student.email)) && (
                  <tr>
                    <td style={styles.infoLabel}>Email:</td>
                    <td style={styles.infoValue}>
                      {user?.email || (interpretation?.student && interpretation.student.email)}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Counsellor Summary */}
      {interpretation.counsellor_summary && (
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Executive Summary</h2>
          <p style={styles.text}>{interpretation.counsellor_summary}</p>
        </div>
      )}

      {/* Score Summary */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Overall Score</h2>
        <div style={styles.scoreBox}>
          <div style={styles.scoreValue}>
            {interpretation.overall_percentage?.toFixed(1) || '0'}%
          </div>
          <div style={styles.scoreLabel}>
            Career Readiness Score
          </div>
        </div>
        {interpretation.readiness_status && (
          <p style={styles.text}>
            <span style={styles.bold}>Status:</span> {interpretation.readiness_status}
          </p>
        )}
        {interpretation.readiness_explanation && (
          <p style={styles.text}>{interpretation.readiness_explanation}</p>
        )}
      </div>

      {/* Key Takeaway */}
      {interpretation.readiness_status && interpretation.overall_percentage && (
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Key Takeaway</h2>
          <p style={styles.text}>
            Your career readiness assessment shows a score of {interpretation.overall_percentage.toFixed(1)}%, 
            indicating a <span style={styles.bold}>{interpretation.readiness_status}</span> status.
          </p>
        </div>
      )}

      {/* Readiness Action Guidance */}
      {interpretation.readiness_action_guidance && interpretation.readiness_action_guidance.length > 0 && (
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Recommended Actions</h2>
          <ul style={styles.list}>
            {interpretation.readiness_action_guidance.map((action, idx) => (
              <li key={idx} style={styles.listItem}>{action}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Risk Level */}
      {interpretation.risk_level && (
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Risk Assessment</h2>
          <p style={styles.text}>
            <span style={styles.bold}>Risk Level:</span> {interpretation.risk_level}
          </p>
          {interpretation.risk_explanation_human && (
            <p style={styles.text}>{interpretation.risk_explanation_human}</p>
          )}
        </div>
      )}

      {/* What This Means */}
      {interpretation.readiness_status && interpretation.career_direction && (
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>What This Means for You</h2>
          <p style={styles.text}>
            Based on your assessment, you are currently in a <span style={styles.bold}>{interpretation.readiness_status}</span> stage. 
            Your career direction suggests a focus on <span style={styles.bold}>{interpretation.career_direction}</span>.
          </p>
          {interpretation.career_direction_reason && (
            <p style={styles.text}>{interpretation.career_direction_reason}</p>
          )}
        </div>
      )}

      {/* Strengths & Improvements */}
      <div style={styles.section}>
        <div style={styles.gridTwo}>
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>Strengths</h3>
            {interpretation.strengths && interpretation.strengths.length > 0 ? (
              <ul style={styles.list}>
                {interpretation.strengths.map((strength, idx) => (
                  <li key={idx} style={styles.listItem}>{strength}</li>
                ))}
              </ul>
            ) : (
              <p style={styles.text}>No strengths identified.</p>
            )}
          </div>
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>Areas for Improvement</h3>
            {interpretation.weaknesses && interpretation.weaknesses.length > 0 ? (
              <ul style={styles.list}>
                {interpretation.weaknesses.map((weakness, idx) => (
                  <li key={idx} style={styles.listItem}>{weakness}</li>
                ))}
              </ul>
            ) : (
              <p style={styles.text}>No areas for improvement identified.</p>
            )}
          </div>
        </div>
      </div>

      {/* Career Direction */}
      {interpretation.career_direction && (
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Career Direction</h2>
          <p style={styles.text}>
            <span style={styles.bold}>{interpretation.career_direction}</span>
          </p>
          {interpretation.career_direction_reason && (
            <p style={styles.text}>{interpretation.career_direction_reason}</p>
          )}
        </div>
      )}

      {/* Career Confidence */}
      {interpretation.career_confidence_level && (
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Career Confidence</h2>
          <p style={styles.text}>
            <span style={styles.bold}>Level:</span> {interpretation.career_confidence_level}
          </p>
          {interpretation.career_confidence_explanation && (
            <p style={styles.text}>{interpretation.career_confidence_explanation}</p>
          )}
        </div>
      )}

      {/* Do Now / Do Later */}
      {((interpretation.do_now_actions && interpretation.do_now_actions.length > 0) || 
        (interpretation.do_later_actions && interpretation.do_later_actions.length > 0)) && (
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Action Plan</h2>
          <div style={styles.gridTwo}>
            {interpretation.do_now_actions && interpretation.do_now_actions.length > 0 && (
              <div style={styles.card}>
                <h3 style={styles.cardTitle}>Do Now (Next 3 Months)</h3>
                <ul style={styles.list}>
                  {interpretation.do_now_actions.map((action, idx) => (
                    <li key={idx} style={styles.listItem}>{action}</li>
                  ))}
                </ul>
              </div>
            )}
            {interpretation.do_later_actions && interpretation.do_later_actions.length > 0 && (
              <div style={styles.card}>
                <h3 style={styles.cardTitle}>Do Later (3-12 Months)</h3>
                <ul style={styles.list}>
                  {interpretation.do_later_actions.map((action, idx) => (
                    <li key={idx} style={styles.listItem}>{action}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Section Scores Table */}
      {interpretation.section_scores && interpretation.section_scores.length > 0 && (
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Section Performance</h2>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.tableHeader}>Section</th>
                <th style={styles.tableHeader}>Score</th>
              </tr>
            </thead>
            <tbody>
              {interpretation.section_scores.map((section, idx) => (
                <tr key={idx}>
                  <td style={styles.tableCell}>{section.section_name || `Section ${section.section_number}`}</td>
                  <td style={styles.tableCell}>
                    {typeof section.score === 'number' 
                      ? `${section.score.toFixed(1)}%` 
                      : section.score || 'N/A'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Roadmap */}
      {interpretation.roadmap && (
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Career Development Roadmap</h2>
          {typeof interpretation.roadmap === 'object' ? (
            <div>
              {interpretation.roadmap.phase1 && (
                <div style={styles.card}>
                  <h3 style={styles.cardTitle}>
                    Phase 1: {interpretation.roadmap.phase1.title || 'Immediate Actions'}
                  </h3>
                  {interpretation.roadmap.phase1.actions && (
                    <ul style={styles.list}>
                      {interpretation.roadmap.phase1.actions.map((action, idx) => (
                        <li key={idx} style={styles.listItem}>{action}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
              {interpretation.roadmap.phase2 && (
                <div style={styles.card}>
                  <h3 style={styles.cardTitle}>
                    Phase 2: {interpretation.roadmap.phase2.title || 'Short-term Goals'}
                  </h3>
                  {interpretation.roadmap.phase2.actions && (
                    <ul style={styles.list}>
                      {interpretation.roadmap.phase2.actions.map((action, idx) => (
                        <li key={idx} style={styles.listItem}>{action}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
              {interpretation.roadmap.phase3 && (
                <div style={styles.card}>
                  <h3 style={styles.cardTitle}>
                    Phase 3: {interpretation.roadmap.phase3.title || 'Long-term Goals'}
                  </h3>
                  {interpretation.roadmap.phase3.actions && (
                    <ul style={styles.list}>
                      {interpretation.roadmap.phase3.actions.map((action, idx) => (
                        <li key={idx} style={styles.listItem}>{action}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
          ) : (
            <p style={styles.text}>{String(interpretation.roadmap)}</p>
          )}
        </div>
      )}

      {/* Career Clusters */}
      {interpretation.career_clusters && interpretation.career_clusters.length > 0 && (
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Recommended Career Clusters</h2>
          <ul style={styles.list}>
            {interpretation.career_clusters.map((cluster, idx) => (
              <li key={idx} style={styles.listItem}>{cluster}</li>
            ))}
          </ul>
        </div>
      )}

      {/* AI Insight Summary */}
      {interpretation.summary && (
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Assessment Summary</h2>
          <p style={styles.text}>{interpretation.summary}</p>
        </div>
      )}

      {/* Counsellor Notes */}
      {counsellorNote && (
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Counsellor Notes</h2>
          <div style={styles.noteBox}>
            <p style={styles.text}>
              <span style={styles.bold}>By:</span> {counsellorNote.counsellor_name || 'Counsellor'}
            </p>
            <p style={styles.text}>
              <span style={styles.bold}>Date:</span> {new Date(counsellorNote.created_at).toLocaleDateString()}
            </p>
            <p style={styles.text}>{counsellorNote.notes}</p>
          </div>
        </div>
      )}

      {/* Disclaimer */}
      <div style={styles.disclaimer}>
        <p style={styles.bold}>Important Information for Parents and Students</p>
        <p style={styles.text}>
          This assessment provides insights into the student's current career exploration stage, strengths, and areas for development. 
          The results are based on the student's responses and reflect their current level of readiness for career decision-making.
        </p>
        <p style={styles.text}>
          This is not a test of intelligence or ability. A lower score does not indicate failure or lack of potential. 
          It simply means the student is in an earlier stage of career exploration and needs more time to develop clarity.
        </p>
        <p style={styles.text}>
          This assessment is designed to provide general career guidance and insights. Results are intended for informational 
          purposes only and should not be considered as definitive career decisions or professional diagnoses. 
          We strongly recommend consulting with a qualified career counsellor to discuss these results in detail.
        </p>
      </div>
    </div>
  );
}

export default ResultPDF;

