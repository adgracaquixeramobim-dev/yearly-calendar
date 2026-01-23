import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from '@react-pdf/renderer';
import { Event, isRecurrentWorshipEvent, isMeetingEvent } from '../types/event';
import {
  organizeRecurrentWorshipByLocation,
  organizeMeetingsByMonth,
} from './eventOrganizer';
import { getMonthNamePT } from './dateUtils';
import { LOGO_BASE64 } from './logoBase64';

const styles = StyleSheet.create({
  page: {
    padding: 34,
    fontSize: 11,
    fontFamily: 'Helvetica',
    backgroundColor: '#ffffff',
  },
  header: {
    textAlign: 'center',
    marginBottom: 20,
  },
  logo: {
    width: 60.33,
    height: 60.33,
    marginBottom: 10,
    alignSelf: 'center',
  },
  title: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 9,
    marginBottom: 3,
  },
  sectionTitle: {
    fontSize: 8,
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 10,
    textAlign: 'center',
  },
  table: {
    display: 'flex',
    width: 'auto',
    borderTopWidth: 0.5,
    borderTopColor: '#000000',
    borderTopStyle: 'solid',
    borderBottomWidth: 0.5,
    borderBottomColor: '#000000',
    borderBottomStyle: 'solid',
    marginBottom: 15,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderBottomColor: '#000000',
    borderBottomStyle: 'solid',
    borderTopWidth: 0.5,
    borderTopColor: '#000000',
    borderTopStyle: 'solid',
    // borderLeftWidth: 1,
    // borderLeftColor: '#000000',
    // borderLeftStyle: 'solid',
    borderRightWidth: 1,
    borderRightColor: '#000000',
    borderRightStyle: 'solid',
    minHeight: 12,
    margin: -0.5,
    padding: 0,
  },
  tableHeader: {
    backgroundColor: '#bfbfbf',
    fontWeight: 'bold',
    fontSize: 5.5,
    borderTopWidth: 1,
    borderTopColor: '#000000',
    borderTopStyle: 'solid',
  },
  tableCell: {
    borderLeftWidth: 1,
    borderLeftColor: '#000000',
    borderLeftStyle: 'solid',
    padding: '3pt',
    fontSize: 5.5,
    textAlign: 'center',
  },
  tableCellDay: {
    width: '33.8pt',
  },
  tableCellMonth: {
    width: '126.8pt',
  },
  tableCellDep: {
    width: '23.2pt',
  },
  tableCellLocation: {
    width: '165.8pt',
  },
  tableCellEvent: {
    width: '119.2pt',
  },
  footer: {
    marginTop: 20,
    fontSize: 5,
    textAlign: 'center',
  },
});

interface PDFDocumentProps {
  events: Event[];
  year: number;
  churchName?: string;
  ministryName?: string;
}

export const CalendarPDFDocument: React.FC<PDFDocumentProps> = ({
  events,
  year,
  churchName = 'Igreja Evangélica Assembleia de Deus no Brasil',
  ministryName = 'Ministério da Graça',
}) => {
  const recurrentWorshipEvents = events.filter(isRecurrentWorshipEvent);
  const meetingEvents = events.filter(isMeetingEvent);

  const worshipServices = organizeRecurrentWorshipByLocation(recurrentWorshipEvents, year);
  const meetingsByMonth = organizeMeetingsByMonth(meetingEvents, year);

  const locations = Array.from(worshipServices.keys());

  const monthGroups = [
    [0, 1, 2],   // Jan, Feb, Mar
    [3, 4, 5],   // Apr, May, Jun
    [6, 7, 8],   // Jul, Aug, Sep
    [9, 10, 11], // Oct, Nov, Dec
  ];


  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Image
            style={styles.logo}
            src={LOGO_BASE64}
          />
          <Text style={styles.title}>{churchName}</Text>
          <Text style={styles.subtitle}>- {ministryName} -</Text>
          <Text style={styles.subtitle}>Calendário de Cultos – {year} – Campo</Text>
        </View>

        {locations.length > 0 && (
          <View>
            <Text style={styles.sectionTitle}>Cultos Recorrentes</Text>
            <View style={styles.table}>
              {Array.from({ length: Math.ceil(locations.length / 3) }).map((_, groupIndex) => {
                const groupLocations = locations.slice(groupIndex * 3, (groupIndex + 1) * 3);
                return (
                  <React.Fragment key={groupIndex}>
                    <View style={[styles.tableRow, styles.tableHeader]} wrap={false} minPresenceAhead={60}>
                      {groupLocations.map((location) => (
                        <View key={location} style={[styles.tableCell, { width: '175.7pt' }]}>
                          <Text>{location}</Text>
                        </View>
                      ))}
                    </View>
                    {(() => {
                      const locationPatternPairs: Array<{
                        location: string;
                        pattern: string;
                        events: string[];
                      }> = [];
                      
                      groupLocations.forEach((location) => {
                        const patternMap = worshipServices.get(location);
                        if (patternMap) {
                          patternMap.forEach((events, pattern) => {
                            if (events && events.length > 0) {
                              locationPatternPairs.push({ location, pattern, events });
                            }
                          });
                        }
                      });
                      
                      if (locationPatternPairs.length === 0) {
                        return null;
                      }
                      
                      const maxPatternsPerLocation = Math.max(
                        ...groupLocations.map((location) => {
                          const patternMap = worshipServices.get(location);
                          if (!patternMap) return 0;
                          let count = 0;
                          patternMap.forEach((events) => {
                            if (events && events.length > 0) count++;
                          });
                          return count;
                        })
                      );
                      
                      const rows = [];
                      for (let patternIndex = 0; patternIndex < maxPatternsPerLocation; patternIndex++) {
                        const rowContent = groupLocations.map((location) => {
                          const patternMap = worshipServices.get(location);
                          if (!patternMap) {
                            return { location, hasEvents: false, pattern: '', events: [] };
                          }
                          
                          const patternsWithEvents: Array<{ pattern: string; events: string[] }> = [];
                          patternMap.forEach((events, pattern) => {
                            if (events && events.length > 0) {
                              patternsWithEvents.push({ pattern, events });
                            }
                          });
                          
                          patternsWithEvents.sort((a, b) => a.pattern.localeCompare(b.pattern));
                          
                          if (patternIndex < patternsWithEvents.length) {
                            const { pattern, events } = patternsWithEvents[patternIndex];
                            return { location, hasEvents: true, pattern, events };
                          }
                          
                          return { location, hasEvents: false, pattern: '', events: [] };
                        });
                        
                        const hasAnyContent = rowContent.some(({ hasEvents }) => hasEvents);
                        if (hasAnyContent) {
                          rows.push(rowContent);
                        }
                      }
                      
                      return rows.map((rowContent, rowIndex) => (
                        <View key={rowIndex} style={styles.tableRow} wrap={false}>
                          {rowContent.map(({ location, hasEvents, pattern, events }) => (
                            <React.Fragment key={location}>
                              <View style={[styles.tableCell, { width: '56.5pt' }]}>
                                <Text>{hasEvents ? pattern : ''}</Text>
                              </View>
                              <View style={[styles.tableCell, { width: '119.2pt' }]}>
                                <Text>{hasEvents ? events.join(', ') : ''}</Text>
                              </View>
                            </React.Fragment>
                          ))}
                        </View>
                      ));
                    })()}
                  </React.Fragment>
                );
              })}
            </View>
          </View>
        )}

        {meetingsByMonth.size > 0 && (
          <View style={{ marginTop: 15 }}>
            <Text style={styles.sectionTitle}>Calendário de Reuniões e Eventos – {year}</Text>
            <View style={styles.table}>
              {monthGroups.map((monthGroup, groupIndex) => {
                const daysInGroup = new Set<number>();
                monthGroup.forEach((month) => {
                  const monthEvents = meetingsByMonth.get(month);
                  if (monthEvents) {
                    monthEvents.forEach((event) => daysInGroup.add(event.day));
                  }
                });
                const sortedDays = Array.from(daysInGroup).sort((a, b) => a - b);

                if (sortedDays.length === 0) return null;

                return (
                  <React.Fragment key={groupIndex}>
                    <View style={[styles.tableRow, styles.tableHeader]} wrap={false} minPresenceAhead={60}>
                      {monthGroup.map((month) => (
                        <React.Fragment key={month}>
                          <View style={[styles.tableCell, styles.tableCellDay]}>
                            <Text>DIA</Text>
                          </View>
                          <View style={[styles.tableCell, styles.tableCellMonth]}>
                            <Text>{getMonthNamePT(month)}</Text>
                          </View>
                          <View style={[styles.tableCell, styles.tableCellDep]}>
                            <Text>DEP</Text>
                          </View>
                        </React.Fragment>
                      ))}
                    </View>
                    {(() => {
                      const monthEventsList = monthGroup.map((month) => {
                        const events = meetingsByMonth.get(month) || [];
                        return [...events].sort((a, b) => a.day - b.day);
                      });
                      
                      const maxEventsPerMonth = Math.max(
                        ...monthEventsList.map((events) => events.length),
                        0
                      );
                      
                      const rows = [];
                      for (let eventIndex = 0; eventIndex < maxEventsPerMonth; eventIndex++) {
                        const rowContent = monthGroup.map((month, monthIndex) => {
                          const events = monthEventsList[monthIndex];
                          const event = events[eventIndex];
                          
                          if (event) {
                            return {
                              month,
                              hasEvent: true,
                              day: event.day,
                              endDay: event.endDay,
                              name: event.name,
                              location: event.location,
                              department: event.department || '-',
                            };
                          }
                          
                          return {
                            month,
                            hasEvent: false,
                            day: '',
                            endDay: undefined,
                            name: '',
                            location: undefined,
                            department: '',
                          };
                        });
                        
                        const hasAnyEvent = rowContent.some(({ hasEvent }) => hasEvent);
                        if (hasAnyEvent) {
                          rows.push(rowContent);
                        }
                      }
                      
                      return rows.map((rowContent, rowIndex) => (
                        <View key={rowIndex} style={styles.tableRow} wrap={false}>
                          {rowContent.map(({ month, hasEvent, day, endDay, name, location, department }) => {
                            const dayDisplay = hasEvent 
                              ? (endDay ? `${day} A ${endDay}` : day.toString())
                              : '';
                            const nameDisplay = hasEvent 
                              ? (location ? `${name} (${location})` : name)
                              : '';
                            return (
                              <React.Fragment key={month}>
                                <View style={[styles.tableCell, styles.tableCellDay]}>
                                  <Text>{dayDisplay}</Text>
                                </View>
                                <View style={[styles.tableCell, styles.tableCellMonth]}>
                                  <Text>{nameDisplay}</Text>
                                </View>
                                <View style={[styles.tableCell, styles.tableCellDep]}>
                                  <Text>{hasEvent ? department : ''}</Text>
                                </View>
                              </React.Fragment>
                            );
                          })}
                        </View>
                      ));
                    })()}
                  </React.Fragment>
                );
              })}
            </View>
          </View>
        )}

        <View style={styles.footer}>
          <Text>Calendário gerado em {new Date().toLocaleDateString('pt-BR')}</Text>
        </View>
      </Page>
    </Document>
  );
};
