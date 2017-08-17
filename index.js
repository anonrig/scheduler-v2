const util = require('util');
const exec = require('child_process').exec;
const cheerio = require('cheerio');
const _ = require('lodash');
const Helper = require('./helper');

const command = `curl 'http://suis.sabanciuniv.edu/prod/bwckschd.p_get_crse_unsec' -H 'Pragma: no-cache' -H 'Origin: http://suis.sabanciuniv.edu' -H 'Accept-Encoding: gzip, deflate' -H 'Accept-Language: en-US,en;q=0.8,tr;q=0.6' -H 'Upgrade-Insecure-Requests: 1' -H 'User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/56.0.2924.87 Safari/537.36' -H 'Content-Type: application/x-www-form-urlencoded' -H 'Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8' -H 'Cache-Control: no-cache' -H 'Referer: http://suis.sabanciuniv.edu/prod/bwckgens.p_proc_term_date' -H 'Cookie: _ga=GA1.2.536968046.1499200690; _gid=GA1.2.972512507.1502325358; _gat=1; SERVERID=BS2' -H 'Connection: keep-alive' -H 'DNT: 1' --data 'term_in=201702&sel_subj=dummy&sel_day=dummy&sel_schd=dummy&sel_insm=dummy&sel_camp=dummy&sel_levl=dummy&sel_sess=dummy&sel_instr=dummy&sel_ptrm=dummy&sel_attr=dummy&sel_subj=GR&sel_subj=AL&sel_subj=ACC&sel_subj=ANTH&sel_subj=ARA&sel_subj=BAN&sel_subj=CHEM&sel_subj=CIP&sel_subj=CS&sel_subj=CONF&sel_subj=CULT&sel_subj=ECON&sel_subj=EE&sel_subj=ENS&sel_subj=ENG&sel_subj=ES&sel_subj=FILM&sel_subj=FIN&sel_subj=FRE&sel_subj=GEN&sel_subj=GER&sel_subj=HART&sel_subj=HIST&sel_subj=HUM&sel_subj=IE&sel_subj=IF&sel_subj=IR&sel_subj=ITA&sel_subj=LAT&sel_subj=LAW&sel_subj=LIT&sel_subj=MJC&sel_subj=MGMT&sel_subj=MRES&sel_subj=MFG&sel_subj=MKTG&sel_subj=MAT&sel_subj=MATH&sel_subj=ME&sel_subj=BIO&sel_subj=NS&sel_subj=OPIM&sel_subj=ORG&sel_subj=PERS&sel_subj=PHIL&sel_subj=PHYS&sel_subj=POLS&sel_subj=PROJ&sel_subj=PSY&sel_subj=RUS&sel_subj=SPS&sel_subj=SOC&sel_subj=SPA&sel_subj=TLL&sel_subj=TS&sel_subj=TUR&sel_subj=VA&sel_crse=&sel_title=&sel_from_cred=&sel_to_cred=&begin_hh=0&begin_mi=0&begin_ap=a&end_hh=0&end_mi=0&end_ap=a' --compressed`;
//{maxBuffer: 9048 * 500}

exec(command, (error, data, stderr) => {
  const $ = cheerio.load(data);
  const classes = $('.pagebodydiv > .datadisplaytable > tbody > tr');
  let response = [];

  classes.each(function(index, element) {
    if (index % 2 == 0) {
      // Header
      const title = $(this).find('.ddlabel a').text();
      if (title.length) {
        // console.log(title);
        const payload = title.split(' - ');
        response.push({
          id: parseInt(payload[1], 10),
          title: payload[0],
          code: payload[2]
        });
      }
    } else {
      const line = $(this).find('.dddefault').find('table tr');

      if (line) {
        line.each(function(lineIndex, lineElement) {
          const columns = $(this).find('td');
          let course = {};
          // Set courses for the current lecture.
          response[response.length - 1].courses = response[response.length - 1].courses || [];
          console.log('columns', columns.length)
          columns.each(function(colIndex, colElement) {
            console.log('colIndex', colIndex, $(this).text())

            switch (colIndex) {
              case 1:
                const time = $(this).text().split(' - ');
                if (time.length > 1) {
                  course.startTime = time[0];
                  course.endTime = time[1];
                } else {
                  course.startTime = null;
                  course.endTime = null;
                }
                break;
              case 2:
                course.day = Helper.getDayAsIndex($(this).text());
                break;
              case 3:
                course.location = $(this).text();
                break;
              case 4:
                const date = $(this).text().split(' - ');
                response[response.length - 1].startDate = Helper.parseDate(date[0]);
                response[response.length - 1].endDate = Helper.parseDate(date[1]);
              case 6:
                course.lecturer = $(this).text().split(' (')[0];
                break;
            }
          });

          if (columns.length) {
            response[response.length - 1].courses.push(course);
          }
        })
      }
    }
  });

  console.log(response[10]);
});


