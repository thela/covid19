import csv
import datetime
import json
import os
import numpy as np
import random

start_date = datetime.datetime(2020, 2, 24)


def json_serial(obj):
    if isinstance(obj, datetime.datetime) or isinstance(obj, datetime.date):
        return obj.__str__()


class DpcCovidData:
    data_json_regioni = 'dpc/COVID-19/dati-json/dpc-covid19-ita-regioni.json'
    dati_regioni_folder = 'dpc/COVID-19/dati-regioni/'

    dati_province_labels = [
        'ricoverati_con_sintomi', 'terapia_intensiva', 'totale_ospedalizzati', 'isolamento_domiciliare',
        'totale_positivi', 'variazione_totale_positivi', 'dimessi_guariti', 'deceduti', 'totale_casi',
        'tamponi'
    ]
    dati_province_folder = 'dpc/COVID-19/dati-province/'

    dati_nazionale_folder = 'dpc/COVID-19/dati-andamento-nazionale/'

    def get_data_nazionale(self):
        data_nazionale = {}
        for daily_filename in os.listdir(self.dati_nazionale_folder):
            try:
                date = datetime.datetime.strptime(daily_filename[36:44], '%Y%m%d').date()

                filename = os.path.join(self.dati_nazionale_folder, daily_filename)

                try:
                    with open(filename, encoding='utf-8') as csvfile:
                        reader_list = list(csv.DictReader(csvfile, delimiter=',', quotechar='"'))
                except UnicodeDecodeError:
                    with open(filename, encoding='latin-1') as csvfile:
                        reader_list = list(csv.DictReader(csvfile, delimiter=',', quotechar='"'))
                res = {}
                if len(reader_list) == 1:
                    data_nazionale[date] = reader_list[0]
                else:
                    raise KeyError

            except ValueError:
                pass

        return data_nazionale

    def get_data_regioni(self):
        data_regioni = {}
        regioni = set()
        for daily_filename in os.listdir(self.dati_regioni_folder):
            try:
                date = datetime.datetime.strptime(daily_filename[24:32], '%Y%m%d').date()

                filename = os.path.join(self.dati_regioni_folder, daily_filename)

                try:
                    with open(filename, encoding='utf-8') as csvfile:
                        reader_list = list(csv.DictReader(csvfile, delimiter=',', quotechar='"'))
                except UnicodeDecodeError:
                    with open(filename, encoding='latin-1') as csvfile:
                        reader_list = list(csv.DictReader(csvfile, delimiter=',', quotechar='"'))
                res = {}
                for regione in reader_list:
                    regioni.add(regione['denominazione_regione'])
                    if regione['denominazione_regione'] not in res:
                        res[regione['denominazione_regione']] = {
                            label: regione[label] for label in self.dati_province_labels
                        }
                    else:
                        raise('doppia regione?')
                data_regioni[date] = res
            except ValueError:
                pass

        return data_regioni, list(regioni)

    def get_regione(self, regione):
        return {day: self.data_regioni[day][regione] for day in self.data_regioni.keys()}

    def get_data_province(self):
        data_province = {}
        for daily_filename in os.listdir(self.dati_province_folder):
            try:
                date = datetime.datetime.strptime(daily_filename[25:33], '%Y%m%d').date()

                filename = os.path.join(self.dati_province_folder, daily_filename)

                try:
                    with open(filename, encoding='utf-8') as csvfile:
                        reader_list = list(csv.DictReader(csvfile, delimiter=',', quotechar='"'))
                except UnicodeDecodeError:
                    with open(filename, encoding='latin-1') as csvfile:
                        reader_list = list(csv.DictReader(csvfile, delimiter=',', quotechar='"'))
                res = {}
                for provincia in reader_list:
                    if provincia['denominazione_regione'] not in res:
                        res[provincia['denominazione_regione']] = {
                            provincia['denominazione_provincia']: {
                                'totale_casi': provincia['totale_casi']
                            }
                        }
                    else:
                        res[provincia['denominazione_regione']][provincia['denominazione_provincia']] = {
                                'totale_casi': provincia['totale_casi']
                            }
                data_province[date] = res
            except ValueError:
                pass

        return data_province

    def get_data_province_in_regione(self, regione):
        return {day: self.data_province[day][regione] for day in self.data_regioni.keys()}

    def plot_province_per_regione(self, regioni, ax=None, json_save=False):
        x_list = list(self.data_province.keys())
        x_list.sort()

        if regioni == 'all':
            regioni = self.regioni

        plots = []
        plot_label = []
        data_italia = {}
        for regione in regioni:
            data_province = self.get_data_province_in_regione(regione)
            province = list(data_province.values())[0].keys()

            if json_save:
                data_italia[regione] = {
                    provincia: {day.__str__(): data_province[day][provincia]['totale_casi'] for day in data_province.keys()}
                    for provincia in province
                }
            else:
                for provincia in province:
                    provincia_data = {day: data_province[day][provincia] for day in data_province.keys()}
                    for plot_line in ['totale_casi']:
                        plot_i, = ax.plot_date(x_list, [int(provincia_data[day][plot_line]) for day in x_list], '.-')
                        plots.append(plot_i)
                        plot_label.append(
                            provincia
                    )

        if json_save:
            with open('chartjs/data/province_per_regione.json', 'w') as json_fp:
                json.dump(
                    data_italia,
                    fp=json_fp,
                    default=json_serial
                )
        else:
            if not ax:
                fig, ax = plt.subplots()
                fig.autofmt_xdate()

                ax.set_xlabel('days')
            ax.legend(plots, plot_label)

    def plot_regioni(self, regioni):

        x_list = list(self.data_regioni.keys())
        x_list.sort()

        fig, ax = plt.subplots()
        ax.set_xlabel('days')
        fig.autofmt_xdate()

        plots = []
        plot_label = []
        for regione in regioni:
            regione_data = self.get_regione(regione)
            for plot_line in ['totale_casi']:
                plot_i, = ax.plot_date(x_list, [int(regione_data[day][plot_line]) for day in x_list], '.-')
                plots.append(plot_i)
                plot_label.append('{}-{}'.format(
                    regione,
                    plot_line)
                )

        ax.legend(plots, plot_label)
        plt.show()

    def roma_analysis(self, ax=None, json_save=False):
        if not ax and not json_save:
            fig, ax = plt.subplots()
            fig.autofmt_xdate()

        x_list = list(self.data_province.keys())
        x_list.sort()

        data_province = self.get_data_province_in_regione('Lazio')
        provincia = 'Roma'
        provincia_data = {day: data_province[day][provincia] for day in data_province.keys()}

        if json_save:
            with open('chartjs/data/roma_analysis.json', 'w') as json_fp:
                json.dump(
                    {day.__str__(): {'totale_casi': int(provincia_data[day]['totale_casi'])} for day in x_list},
                    fp=json_fp,
                    default=json_serial
                )
        else:
            ax.set_xlabel('days')
            ax.set_yscale('log')
            plots = []
            plot_label = []

            # 'totale_casi'
            # for plot_line in ['totale_casi']:
            plot_line = 'totale_casi'
            plot_i, = ax.plot_date(x_list, [int(provincia_data[day][plot_line]) for day in x_list], '.-')
            plots.append(plot_i)
            plot_label.append(
                '{} {}'.format(plot_line, provincia)
            )
            a, b = exp_fit(
                x_list, [int(provincia_data[day][plot_line]) for day in x_list],
                guess_origin=True,
                #point1=22, point2=30)
                point1=9, point2=22)
            plot_i = plot_exp(ax, x_list, a, b)
            plots.append(plot_i)
            plot_label.append('Exp. fit')
            #for day in x_list:
            #    print('{};{}'.format(day.timetuple().tm_yday, int(provincia_data[day][plot_line])))
            ax.text(0.12, 0.6, '''a={:.2e}
    b={:.2}'''.format(a, b),
                horizontalalignment='left',
                verticalalignment='top',
                fontsize=11, color='black',
                transform=ax.transAxes)

            # a, b = exp_fit(x, [int(data_dict[day]['Deaths']) for day in x], guess_origin=True)
            # plot_exp(ax, x, a, b)
            ax.legend(plots, plot_label)

    def regione_analysis(self, regione, ax=None):
        if not ax:
            fig, ax = plt.subplots()
            fig.autofmt_xdate()
        ax.set_xlabel('days')

        x_list = list(self.data_regioni.keys())
        x_list.sort()
        
        data_regione = self.get_regione(regione)
        #ax.set_yscale('log')
        ax.stackplot(
            x_list,
            [int(data_regione[day]['deceduti']) for day in x_list],
            [int(data_regione[day]['dimessi_guariti']) for day in x_list],
            [int(data_regione[day]['ricoverati_con_sintomi']) for day in x_list],

            [int(data_regione[day]['terapia_intensiva']) for day in x_list],
            [int(data_regione[day]['isolamento_domiciliare']) for day in x_list],
            labels=['deceduti', 'dimessi_guariti', 'ricoverati_con_sintomi', 'terapia_intensiva', 'isolamento_domiciliare']
        )
        ax.plot(
            x_list,
            [int(data_regione[day]['totale_casi']) for day in x_list], '-o'
        )
        ax.legend(loc='upper left')

    def get_newcases_vs_totalcases_by_regione(self, regione):
        data_regione = self.get_regione(regione)
        # per ogni giorno, mi metto un dict con total_cases e total_new_cases
        new_cases_list = [
            [day, int(data['totale_casi'])] for day, data in data_regione.items()
        ]
        new_cases_list.sort()

        for list_index, daily_cases in enumerate(new_cases_list):
            new_cases_list[list_index].append(
                (new_cases_list[list_index][1] - new_cases_list[list_index-1][1])
                if list_index
                else new_cases_list[list_index][1]
            )

        total_cases = [new_cases[1] for new_cases in new_cases_list]
        new_cases = [new_cases[2] for new_cases in new_cases_list]
        new_cases_average = []
        for list_index, daily_new_cases in enumerate(new_cases):
            if list_index == 0:
                new_cases_average.append(daily_new_cases)
            else:
                cases_in_week_before = []
                for days_in_week_before in range(7):
                    if list_index >= days_in_week_before:
                        cases_in_week_before.append(new_cases[list_index-days_in_week_before])
                new_cases_average.append(sum(cases_in_week_before)/len(cases_in_week_before))

        return total_cases, new_cases_average

    def plot_newcases_vs_totalcases_regioni(self, regioni, ax=None, json_save=False):
        if regioni == 'all':
            regioni = self.regioni
        if not ax and not json_save:
            fig, ax = plt.subplots()
            fig.autofmt_xdate()

            ax.set_xlabel('Total confirmed cases')

            ax.set_xscale('log')
            ax.set_yscale('log')

            ax.set_ylabel('New confirmed cases (weekly mean)')
        plots = []
        if json_save:
            json_data = {}

        for regione in regioni:
            total_cases, new_cases_average = self.get_newcases_vs_totalcases_by_regione(regione=regione)

            if json_save:
                json_data[regione] = [{
                    'x': x,
                    'y': y
                } for x, y in zip(total_cases, new_cases_average)]
            else:
                plot_i, = ax.plot(
                    total_cases, new_cases_average,
                    '.-')
                plots.append(plot_i)

        if json_save:
            with open('chartjs/data/plot_newcases_vs_totalcases_regioni.json', 'w') as json_fp:
                json.dump(
                    json_data,
                    fp=json_fp,
                    default=json_serial
                )
        else:
            ax.set_ylim(bottom=10)
            ax.set_xlim(left=100)
            ax.legend(plots, regioni)

    def italia_analysis(self, ax=None, json_save=False):
        if not ax and not json_save:
            fig, ax = plt.subplots()
            fig.autofmt_xdate()

        x_list = list(self.data_nazionale.keys())
        x_list.sort()
        if json_save:
            with open('chartjs/data/italia_analysis.json', 'w') as json_fp:
                json.dump(
                    {day.__str__(): {key: int(self.data_nazionale[day][key]) for key in
                           ['terapia_intensiva', 'ricoverati_con_sintomi', 'isolamento_domiciliare', 'dimessi_guariti',
                            'deceduti']} for day in x_list},
                    fp=json_fp,
                    default=json_serial
                )
        else:
            ax.set_xlabel('days')
            #ax.set_yscale('log')
            ax.stackplot(
                x_list,
                [int(self.data_nazionale[day]['terapia_intensiva']) for day in x_list],
                [int(self.data_nazionale[day]['ricoverati_con_sintomi']) for day in x_list],
                [int(self.data_nazionale[day]['isolamento_domiciliare']) for day in x_list],
                [int(self.data_nazionale[day]['dimessi_guariti']) for day in x_list],
                [int(self.data_nazionale[day]['deceduti']) for day in x_list],
                labels=['terapia_intensiva', 'ricoverati_con_sintomi', 'isolamento_domiciliare', 'dimessi_guariti', 'deceduti']
            )
            ax.plot(
                x_list,
                [int(self.data_nazionale[day]['terapia_intensiva'])+int(self.data_nazionale[day]['ricoverati_con_sintomi'])+int(self.data_nazionale[day]['isolamento_domiciliare'])
                 for day in x_list], '-o'
            )
            ax.legend(loc='upper left')

    def __init__(self):
        self.data_province = self.get_data_province()
        self.data_regioni, self.regioni = self.get_data_regioni()
        self.data_nazionale = self.get_data_nazionale()


class CssegiCovidData:
    cssegi_daily_reports_folder = 'CSSEGI/COVID-19/csse_covid_19_data/csse_covid_19_daily_reports/'
    plot_lines = ['Confirmed', 'Deaths', 'Recovered']

    replacements = {
        'Korea, South': 'South Korea',
        'Mainland China': 'China',
        'UK': 'United Kingdom',
        'US': 'United States of America'
    }

    @staticmethod
    def covid_daterange():
        for n in range(int((datetime.date.today() - datetime.date(2020, 1, 22)).days + 1)):
            yield start_date + datetime.timedelta(n)

    def get_data_from_dayfile(self, filename):
        countries = set()
        try:
            with open(filename, encoding='utf-8') as csvfile:
                reader_list = list(csv.DictReader(csvfile, delimiter=',', quotechar='"'))
        except UnicodeDecodeError:
            with open(filename, encoding='latin-1') as csvfile:
                reader_list = list(csv.DictReader(csvfile, delimiter=',', quotechar='"'))
        _res = {}
        for row in reader_list:
            try:
                country = row['Country/Region']
            except KeyError:
                country = row['Country_Region']
            if country in self.replacements:
                country = self.replacements[country]

            countries.add(country)
            if country in _res:
                for key in self.plot_lines:

                    _res[country][key] += int(row[key])
            else:
                _res[country] = {key: int(row[key]) for key in self.plot_lines}
        return _res, countries

    def get_daily_data(self):
        countries = set()
        res = {}
        for daily_filename in os.listdir(self.cssegi_daily_reports_folder):
            try:

                res[datetime.datetime.strptime(daily_filename[0:10], '%m-%d-%Y')], d_countries = self.get_data_from_dayfile(
                    os.path.join(
                        self.cssegi_daily_reports_folder, '{}.csv'.format(

                            datetime.datetime.strptime(daily_filename[0:10], '%m-%d-%Y').strftime('%m-%d-%Y'))
                    ))
                for country in d_countries:
                    countries.add(country)
            except ValueError:
                pass
        return res, countries

    def get_daily_data_by_country(self, country, start_from_cases=None):
        if not start_from_cases:
            return {day: day_data[country] for day, day_data in self.daily_data.items() if country in day_data}
        else:
            res = []
            threshold_passed = False
            for day in self.covid_daterange():
                if day in self.daily_data:
                    day_data = self.daily_data[day]
                    if country in day_data:
                        if not threshold_passed and int(day_data[country]['Confirmed']) > start_from_cases:
                            threshold_passed = True
                        if threshold_passed:
                            res.append(day_data[country])
            return res

    def plot_countries(self, country):

        data_dict = self.get_daily_data_by_country(country=country)
        # ['Italy', 'Mainland China', 'Germany', 'Spain', 'Iran (Islamic Republic of)']

        plot_lines = list(self.plot_lines)
        x_list = list(data_dict.keys())
        x_list.sort()

        fig, ax = plt.subplots()
        ax.set_xlabel('days')
        fig.autofmt_xdate()
        #ax.set_xticklabels([x.date() for x in x_list], rotation=45)

        ax.set_ylabel('individuals')
        plots = []
        for plot_line in self.plot_lines:
            plot_i, = ax.plot_date(x_list, [int(data_dict[day][plot_line]) for day in x_list], '.-')
            plots.append(plot_i)


        '''plot_i, = ax.plot_date(
            x, [data_dict[day]['Confirmed']-(data_dict[day]['Deaths']+data_dict[day]['Recovered']) for day in x], '.-')
        plots.append(plot_i)'''
        if False:
            a, b = exp_fit(x_list, [int(data_dict[day]['Confirmed']) for day in x_list], guess_origin=True)
            plot_i = plot_exp(ax, x_list, a, b)
            plots.append(plot_i)
            plot_lines.append('Exp. fit')

            ax.text(0.12, 0.6, '''a={}
        b={:.2%}'''.format(a, b),
                    horizontalalignment='left',
                    verticalalignment='top',
                    fontsize=11, color='black',
                    transform=ax.transAxes)


            # a, b = exp_fit(x, [int(data_dict[day]['Deaths']) for day in x], guess_origin=True)
            # plot_exp(ax, x, a, b)
        ax.legend(plots, plot_lines)
        plt.show()

    def plot_countries2(self, countries, ax=None):
        if not ax:
            fig, ax = plt.subplots()
            fig.autofmt_xdate()

        ax.set_xlabel('days')
        # ax.set_xticklabels([x.date() for x in x_list], rotation=45)

        ax.set_ylabel('individuals')
        plots = []
        for country in countries:
            data_dict = self.get_daily_data_by_country(country=country)

            plot_lines = list(self.plot_lines)
            x_list = list(data_dict.keys())
            x_list.sort()

            plot_i, = ax.plot_date(
                x_list,
                [int(data_dict[day]['Confirmed']) - int(data_dict[day]['Deaths']) - int(data_dict[day]['Recovered']) for day in x_list],
                '.-')
            plots.append(plot_i)

        ax.legend(plots, countries)

    def plot_countries_offsetstart(self, countries, start_from_cases=100, ax=None):
        if not ax:
            fig, ax = plt.subplots()
            fig.autofmt_xdate()

        ax.set_xlabel('days from {}th case'.format(start_from_cases))

        ax.set_ylabel('cases')
        plots = []
        for country in countries:
            data_list = self.get_daily_data_by_country(country=country, start_from_cases=start_from_cases)

            plot_lines = list(self.plot_lines)
            plot_i, = ax.plot([
                int(data_dict['Confirmed']) - int(data_dict['Deaths']) - int(data_dict['Recovered'])
                for data_dict in data_list],
                '.-')
            plots.append(plot_i)

        ax.legend(plots, countries)

    def get_newcases_vs_totalcases_by_country(self, country):
        country_data = self.get_daily_data_by_country(country=country)
        # per ogni giorno, mi metto un dict con total_cases e total_new_cases
        new_cases_list = [
            [day, data['Confirmed']] for day, data in country_data.items()
        ]
        new_cases_list.sort()

        for list_index, daily_cases in enumerate(new_cases_list):
            new_cases_list[list_index].append(
                (new_cases_list[list_index][1] - new_cases_list[list_index-1][1])
                if list_index
                else new_cases_list[list_index][1]
            )

        total_cases = [new_cases[1] for new_cases in new_cases_list]
        new_cases = [new_cases[2] for new_cases in new_cases_list]
        new_cases_average = []
        for list_index, daily_new_cases in enumerate(new_cases):
            if list_index == 0:
                new_cases_average.append(daily_new_cases)
            else:
                cases_in_week_before = []
                for days_in_week_before in range(7):
                    if list_index >= days_in_week_before:
                        cases_in_week_before.append(new_cases[list_index-days_in_week_before])
                new_cases_average.append(sum(cases_in_week_before)/len(cases_in_week_before))

        return total_cases, new_cases_average

    def plot_newcases_vs_totalcases(self, countries, ax=None, json_save=False):
        if not ax and not json_save:
            fig, ax = plt.subplots()
            fig.autofmt_xdate()

        if countries == 'all':
            countries = self.countries

        plots = []
        if json_save:
            json_data = {}

        for country in countries:
            total_cases, new_cases_average = self.get_newcases_vs_totalcases_by_country(country=country)

            if json_save:
                json_data[country] = [{
                    'x': x,
                    'y': y
                } for x, y in zip(total_cases, new_cases_average)]
            else:
                plot_i, = ax.plot(
                    total_cases, new_cases_average,
                    '.-')
                plots.append(plot_i)

        if json_save:
            with open('chartjs/data/plot_newcases_vs_totalcases.json', 'w') as json_fp:
                json.dump(
                    json_data,
                    fp=json_fp,
                    default=json_serial
                )
        else:
            ax.set_xlabel('Total confirmed cases')

            ax.set_xscale('log')
            ax.set_yscale('log')

            ax.set_ylabel('New confirmed cases (weekly mean)')
            ax.set_ylim(bottom=10)
            ax.set_xlim(left=100)
            ax.legend(plots, countries)

    def __init__(self):
        self.daily_data, self.countries = self.get_daily_data()


def plot_exp(ax, x_list, a, b):
    plot, = ax.plot_date(x_list, [a * np.exp(day.timetuple().tm_yday * b) for day in x_list], '.-')
    return plot


def exp_fit(x_list, y_list, guess_origin=False, point1=9, point2=16):
    def a_b_from_2points(p1, p2):
        log_y2_y1 = np.log(p2[1] / p1[1])
        x2_x1_1 = 1 / (p2[0] - p1[0])
        _a = p1[1] * np.exp(-p1[0] * log_y2_y1 * x2_x1_1)
        _b = log_y2_y1 * x2_x1_1

        return _a, _b

    def r_from_coefficients(a, b):
        for point_index in range(len(y_list)):
            print(
                np.exp(b * (y_list[point_index])),
                y_list[point_index]
            )

    # takes two random points in the list, calculates the coefficients and the R^2
    '''rand1 = random.randint(10, len(y_list))

    while True:
        rand2 = random.randint(10, len(y_list))
        if rand1 != rand2:
            break'''

    # [day.timetuple().tm_yday for day in x_list].index(59) -> 9
    # [day.timetuple().tm_yday for day in x_list].index(66) -> 16
    rand1 = point1
    rand2 = point2

    a, b = a_b_from_2points(

        [x_list[rand1].timetuple().tm_yday, y_list[rand1]],
        [x_list[rand2].timetuple().tm_yday, y_list[rand2]]
    )
    # r_from_coefficients(a, b)

    return a, b


if __name__ == "__main__":
    only_json = True
    dpc_covid_data = DpcCovidData()
    covid_data = CssegiCovidData()
    if only_json:
        dpc_covid_data.roma_analysis(json_save=True)
        dpc_covid_data.italia_analysis(json_save=True)
        dpc_covid_data.plot_newcases_vs_totalcases_regioni(
            'all', # ['Lombardia', 'Lazio', 'Veneto', 'Toscana', 'Emilia-Romagna', 'Calabria', 'Umbria', 'Marche', 'Piemonte']
            json_save=True
        )
        dpc_covid_data.plot_province_per_regione(regioni='all', json_save=True)
        covid_data.plot_newcases_vs_totalcases(
            'all',  # ['Italy', 'Spain', 'Iran', 'United States of America', 'South Korea', 'United Kingdom', 'Japan'],
            json_save=True
        )
    else:
        import matplotlib as mpl
        import matplotlib.pyplot as plt

        # Collect all the font names available to matplotlib
        # import matplotlib.font_manager as fm
        #font_names = [f.name for f in fm.fontManager.ttflist]

        # Create figure object and store it in a variable called 'fig'
        fig = plt.figure(figsize=(4, 4))
        mpl.rcParams['font.family'] = 'Comfortaa'
        plt.rcParams['font.size'] = 9
        plt.rcParams['axes.linewidth'] = 2
        # ===============
        #  First subplot
        # ===============
        # set up the axes for the first plot
        # [left, bottom, width, height]
        border = .05
        subplot_size = .38
        bottom_offset = .04
        # ax1 = fig.add_subplot(2, 2, 3)
        ax1 = fig.add_axes([border, border+bottom_offset, subplot_size, subplot_size])
        ax1.figure.autofmt_xdate()
        ax1.xaxis.set_tick_params(which='major', size=10, width=2, direction='in', top='on')
        ax1.xaxis.set_tick_params(which='minor', size=7, width=2, direction='in', top='on')
        ax1.yaxis.set_tick_params(which='major', size=10, width=2, direction='in', right='on')
        ax1.yaxis.set_tick_params(which='minor', size=7, width=2, direction='in', right='on')
        #dpc_covid_data.regione_analysis('Lazio', ax1)
        dpc_covid_data.roma_analysis(ax1, json_save=False)

        # ax2 = fig.add_subplot(2, 2, 4)
        ax2 = fig.add_axes([.5+border, border+bottom_offset, subplot_size, subplot_size])
        ax2.figure.autofmt_xdate()
        dpc_covid_data.italia_analysis(ax2, json_save=False)

        ax4 = fig.add_axes([.5+border, .5+border+bottom_offset, subplot_size, subplot_size])
        dpc_covid_data.plot_newcases_vs_totalcases_regioni(
            ['Lombardia', 'Lazio', 'Veneto', 'Toscana', 'Emilia-Romagna', 'Calabria', 'Umbria', 'Marche', 'Piemonte'], ax4)

        ax3 = fig.add_axes([border, .5+border+bottom_offset, subplot_size, subplot_size])
        covid_data.plot_newcases_vs_totalcases(
            ['Italy', 'Spain', 'Iran', 'United States of America', 'South Korea', 'United Kingdom', 'Japan'],
            ax3)
        plt.show()
        '''
        covid_data.plot_countries2(
            ['Italy', 'Germany', 'Spain', 'Iran', 'US', 'India', 'Australia', 'United Kingdom', 'South Korea', 'China', 'Japan'],
            ax3
        )
        dpc_covid_data.plot_province_per_regione('Lazio')
        dpc_covid_data.plot_regioni(['Lazio', 'Lombardia', 'Veneto', 'Emilia Romagna'])
    
        if True:
            covid_data = CssegiCovidData()
            countries = list(covid_data.countries)'''
