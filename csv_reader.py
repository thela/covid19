import csv
import datetime
import json
import os

import numpy as np

dpc_folder = os.path.expanduser('~/Documents/sources/dpc/COVID-19')
cssegi_folder = os.path.expanduser('~/Documents/sources/CSSEGI/COVID-19')

start_date = datetime.datetime(2020, 2, 24)


def json_serial(obj):
    if isinstance(obj, datetime.datetime) or isinstance(obj, datetime.date):
        return obj.__str__()


class WorldPopulation:
    # from https://data.worldbank.org/indicator/SP.POP.TOTL with http://api.worldbank.org/v2/en/indicator/SP.POP.TOTL?downloadformat=csv
    data_source = 'other_data/API_SP.POP.TOTL_DS2_en_csv_v2_1217749.csv'

    def population_by_country_by_year(self, year):
        # TODO check that year as a string is 4 character and is between 1960 and 2019
        return {nation_list['Country Name']: nation_list[str(year)] for nation_list in self.world_population_data}

    def __init__(self):
        with open(self.data_source, encoding='utf-8-sig') as csvfile:
            for row in range(4):
                csvfile.readline()
            self.world_population_data = list(csv.DictReader(csvfile, delimiter=',', quotechar='"'))
        self.population_by_country = self.population_by_country_by_year(2019)


class ItalianPopulation:

    data_source = 'other_data/tavola_pop_res01.csv'

    def __init__(self):
        with open(self.data_source, encoding='utf-8-sig') as csvfile:
            for row in range(2):
                csvfile.readline()
            self.italian_population_data = list(csv.DictReader(csvfile, delimiter=',', quotechar='"'))
        self.population_by_province = {province_list['Province']: province_list['Maschi + Femmine'] for province_list in self.italian_population_data}


class DpcCovidData:
    data_json_regioni = os.path.join(dpc_folder, 'dati-json/dpc-covid19-ita-regioni.json')
    dati_regioni_folder = os.path.join(dpc_folder, 'dati-regioni/')

    dati_province_labels = [
        'ricoverati_con_sintomi', 'terapia_intensiva', 'totale_ospedalizzati', 'isolamento_domiciliare',
        'totale_positivi', 'variazione_totale_positivi', 'dimessi_guariti', 'deceduti', 'totale_casi',
        'tamponi'
    ]
    dati_province_folder = os.path.join(dpc_folder, 'dati-province/')

    dati_nazionale_folder = os.path.join(dpc_folder, 'dati-andamento-nazionale/')

    nomi_trentino = ['P.A. Bolzano', 'P.A. Trento']

    popolazione_provincia = ItalianPopulation().population_by_province

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
        """

        'ricoverati_con_sintomi': dato,
        'terapia_intensiva': dato,
        'totale_ospedalizzati': ricoverati_con_sintomi + terapia_intensiva,
        'isolamento_domiciliare': dato,
        'totale_positivi': totale_ospedalizzati + isolamento_domiciliare,
        'variazione_totale_positivi': totale_positivi(day) - totale_positivi(day-1),
        'nuovi_positivi': dato,
        'dimessi_guariti': dato,
        'deceduti': dato,
        'casi_da_sospetto_diagnostico': dato,
        'casi_da_screening': dato,
        'totale_casi': totale_positivi + dimessi_guariti + deceduti,
        'tamponi': dato,
        'casi_testati': dato,
        :return:
        """
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
                    denominazione_regione = regione['denominazione_regione']
                    if regione['denominazione_regione'] in ['P.A. Bolzano', 'P.A. Trento']:
                        denominazione_regione = 'Trentino Alto Adige'

                    if denominazione_regione not in regioni:
                        regioni.add(denominazione_regione)

                    if denominazione_regione not in res:
                        res[denominazione_regione] = {
                            label: regione[label] for label in self.dati_province_labels
                        }
                    else:
                        for label in self.dati_province_labels:

                            res[denominazione_regione][label] += regione[label]
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
        if regione != 'Trentino Alto Adige':
            return {day: self.data_province[day][regione] for day in self.data_regioni.keys()}
        else:
            #accorpo il trentino
            _res = {}
            for day in self.data_regioni.keys():
                _res[day] = {}
                for denominazione in self.nomi_trentino:
                    for provincia in self.data_province[day][denominazione]:
                        if provincia not in _res[day]:
                            _res[day][provincia] = self.data_province[day][denominazione][provincia]
                        else:
                            for label in self.data_province[day][denominazione][provincia]:
                                if label in _res[day][provincia]:
                                    _res[day][provincia][label] = int(_res[day][provincia][label]) + int(self.data_province[day][denominazione][provincia][label])
                                else:
                                    _res[day][provincia][label] = int(self.data_province[day][denominazione][provincia][label])

            return _res

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
                data_italia[regione] = {}
                '''if provincia in ['In fase di definizione', 'fuori Regione/P.A.']:
                    provincia_regione = 'In fase di definizione/aggiornamento'
                else:
                    provincia_regione = provincia'''

                for day in data_province.keys():
                    for provincia in data_province[day]:
                        if provincia not in data_italia[regione]:
                            data_italia[regione][provincia] = []
                        data_italia[regione][provincia].append(
                            {
                                'x': day.__str__(),
                                'y': data_province[day][provincia]['totale_casi']}

                        )

                '''data_italia[regione] = {
                    provincia: [
                        {
                            'x': day.__str__(),
                            'y': data_province[day][provincia]['totale_casi']} for day in data_province.keys()]
                    for provincia in province
                }'''
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

    def save_data_regioni(self, regioni):

        if regioni == 'all':
            regioni = self.regioni

        data_italia = {}
        for regione in regioni:
            data_regione = self.get_regione(regione)
            data_italia[regione] = {}

            for day in data_regione.keys():
                for number_type in data_regione[day]:
                    if number_type not in data_italia[regione]:
                        data_italia[regione][number_type] = []
                    data_italia[regione][number_type].append(
                        {
                            'x': day.__str__(),
                            'y': data_regione[day][number_type]}

                    )

        with open('chartjs/data/data_regione.json', 'w') as json_fp:
            json.dump(
                data_italia,
                fp=json_fp,
                default=json_serial
            )

    def tamponi_data(self, regioni):

        if regioni == 'all':
            regioni = self.regioni

        data_italia = {}
        for regione in regioni:
            data_regione = self.get_regione(regione)
            data_italia[regione] = {
                'tamponi': [],
                'nuovi_casi': [],
                'percentuale_positivi': []
            }

            nuovi_tamponi_dict = {}
            for day in (regione_tamponi := {day: data_regione[day]['tamponi'] for day in data_regione.keys()}):
                nuovi_tamponi = int(regione_tamponi[day])
                day_before = day - datetime.timedelta(days=1)

                if day_before in regione_tamponi:
                    nuovi_tamponi -= int(regione_tamponi[day_before])

                data_italia[regione]['tamponi'].append({
                        'x': day.__str__(),
                        'y': nuovi_tamponi
                })
                nuovi_tamponi_dict[day.__str__()] = nuovi_tamponi

            for day in (regione_malati := {day: data_regione[day]['totale_casi'] for day in data_regione.keys()}):
                nuovi_casi = int(regione_malati[day])
                day_before = day - datetime.timedelta(days=1)

                if day_before in regione_malati:
                    nuovi_casi -= int(regione_malati[day_before])

                data_italia[regione]['nuovi_casi'].append({
                    'x': day.__str__(),
                    'y': nuovi_casi
                })

            for day_data in data_italia[regione]['nuovi_casi']:
                day = day_data['x']
                nuovi_casi = day_data['y']
                data_italia[regione]['percentuale_positivi'].append({
                    'x': day,
                    'y': nuovi_casi/nuovi_tamponi_dict[day]*100 if nuovi_tamponi_dict[day] != 0 else 0
                })

        with open('chartjs/data/data_tamponi.json', 'w') as json_fp:
            json.dump(
                data_italia,
                fp=json_fp,
                default=json_serial
            )

    def nuovi_malati_per_regione(self, regioni, ax=None, json_save=False):
        x_list = list(self.data_province.keys())
        x_list.sort()

        if regioni == 'all':
            regioni = self.regioni

        plots = []
        plot_label = []
        data_italia = {}
        for regione in regioni:
            data_province = self.get_data_province_in_regione(regione)
            data_italia[regione] = {}
            province = list(data_province.values())[0].keys()

            if json_save:

                for day in data_province.keys():
                    day_before = day - datetime.timedelta(days=1)

                    for provincia in data_province[day]:
                        if provincia not in data_italia[regione]:
                            data_italia[regione][provincia] = []

                        if day_before in data_province and provincia in data_province[day_before]:
                            data_italia[regione][provincia].append({
                                'x': day.__str__(),
                                'y': int(data_province[day][provincia]['totale_casi']) -
                                        int(data_province[day_before][provincia][
                                            'totale_casi'])})
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
            with open('chartjs/data/nuovi_malati_per_regione.json', 'w') as json_fp:
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

    def nuovi_malati_per_regione(self, regioni, ax=None, json_save=False):
        x_list = list(self.data_province.keys())
        x_list.sort()

        if regioni == 'all':
            regioni = self.regioni

        plots = []
        plot_label = []
        data_italia = {}
        for regione in regioni:
            data_province = self.get_data_province_in_regione(regione)
            data_italia[regione] = {}
            province = list(data_province.values())[0].keys()

            if json_save:

                for day in data_province.keys():
                    day_before = day - datetime.timedelta(days=1)

                    for provincia in data_province[day]:
                        if provincia not in data_italia[regione]:
                            data_italia[regione][provincia] = []

                        if day_before in data_province and provincia in data_province[day_before]:
                            data_italia[regione][provincia].append({
                                'x': day.__str__(),
                                'y': int(data_province[day][provincia]['totale_casi']) -
                                     int(data_province[day_before][provincia][
                                             'totale_casi'])})
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
            with open('chartjs/data/nuovi_malati_per_regione.json', 'w') as json_fp:
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
    cssegi_daily_reports_folder = os.path.join(cssegi_folder, 'csse_covid_19_data/csse_covid_19_daily_reports/')
    plot_lines = ['Confirmed', 'Deaths', 'Recovered']

    population_by_country = WorldPopulation().population_by_country

    replacements = {
        'Korea, South': 'South Korea',
        'Mainland China': 'China',
        'UK': 'United Kingdom',
        'US': 'United States of America',
        "North Ireland": 'United Kingdom',
        "Iran (Islamic Republic of)": "Iran",
        "Gambia": "The Gambia",
        "Hong Kong": "Hong Kong SAR",
        "Macau": "Macao SAR",
        "St. Martin": "Saint Martin",
        "Holy See": "Vatican City",
        "Congo (Brazzaville)": "Congo",
        "Bahamas": "Bahamas, The",
        "The Bahamas": "Bahamas, The",
        "French Guiana": "France",
        "Viet Nam": "Vietnam",
        "East Timor": "Timor-Leste",
        "Cape Verde": "Cabo Verde",
        "Republic of Moldova": "Moldova",
        " Azerbaijan": "Azerbaijan",
        "The Gambia": "Gambia, The",
        "Czechia": "Czech Republic",
        "Republic of Ireland": "Ireland",
        "Russian Federation": "Russia",
        "Congo (Kinshasa)": "Dem. Rep. Congo",
    }

    country_translation_wp = {
        'United States of America': 'United States',
        "Saint Martin": "St. Martin (French part)",
        "Republic of Korea": "Korea, Rep.",
        "Syria": "Syrian Arab Republic",
        "Venezuela": "Venezuela, RB",
        "Iran": "Iran, Islamic Rep.",
        "Macao SAR": "Macao SAR, China",
        "Yemen": "Yemen, Rep.",
        "Saint Lucia": "St. Lucia",
        "Dem. Rep. Congo": "Congo, Dem. Rep.",
        "South Korea": "Korea, Rep.",
        "Hong Kong SAR": "Hong Kong SAR, China",
        "Saint Vincent and the Grenadines": "St. Vincent and the Grenadines",
        "Laos": "Lao PDR",
        "Slovakia": "Slovak Republic",
        "Western Sahara": "",
        "Saint Kitts and Nevis": "St. Kitts and Nevis",
        "Kyrgyzstan": "Kyrgyz Republic",
        "Brunei": "Brunei Darussalam",
        "Egypt": "Egypt, Arab Rep.",
        "Congo": "Congo, Rep.",
        "Gambia, The": "The Gambia",
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
        """

        :param country:
        :param start_from_cases:
        :return: a dictionary with days as keys, and as values a dictionary of
                    'Confirmed'
                    'Deaths'
                    'Recovered'
                    cumulative values since the beginning
        """
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

    def cumulative_country_tipology_day(self):
        if not self.cumulative_country_tipology_day_data:
            self.cumulative_country_tipology_day_data = {}
            labels = ['Confirmed',
                      'Deaths',
                      'Recovered',
                      'Active'
                      ]

            for country in self.countries:
                data_dict = self.get_daily_data_by_country(country=country)

                self.cumulative_country_tipology_day_data[country] = {
                    'confirmed': {},
                    'deaths': {},
                    'recovered': {},
                    'active': {},
                }

                ordered_days = list(data_dict.keys())
                ordered_days.sort()
                for day in ordered_days:
                    for label in labels:
                        try:
                            self.cumulative_country_tipology_day_data[country][label.lower()][day] = int(data_dict[day][label])

                        except KeyError:
                            self.cumulative_country_tipology_day_data[country][label.lower()][day] = int(data_dict[day]['Confirmed']) - int(
                                data_dict[day]['Deaths']) - int(
                                data_dict[day]['Recovered'])

    def daily_country_tipology_day(self):
        def process_tipology(tipology_data):

            daily_data = {}
            previous_day = None
            ordered_days = list(tipology_data.keys())
            ordered_days.sort()
            for day in ordered_days:
                if not previous_day:
                    daily_data[day] = tipology_data[day]
                else:
                    daily_data[day] = tipology_data[day] - tipology_data[previous_day]

                # print(country, tipology, day, tipology_data[day], daily_data[day])

                # at the end of the loop, day becomes previous_day
                previous_day = day
            return daily_data

        if not self.daily_country_tipology_day_data:
            self.cumulative_country_tipology_day()
            self.daily_country_tipology_day_data = {}

            for country, country_data in self.cumulative_country_tipology_day_data.items():
                self.daily_country_tipology_day_data[country] = {
                    'confirmed': {},
                    'deaths': {},
                    'recovered': {},
                    'active': {},
                }
                for tipology, tipology_data in country_data.items():
                    '''daily_data = {}
                    previous_day = None
                    ordered_days = list(tipology_data.keys())
                    ordered_days.sort()
                    for day in ordered_days:
                        if not previous_day:
                            daily_data[day] = tipology_data[day]
                        else:
                            daily_data[day] = tipology_data[day] - tipology_data[previous_day]

                        print(country, tipology, day, tipology_data[day], daily_data[day])

                        # at the end of the loop, day becomes previous_day
                        previous_day = day'''
                    self.daily_country_tipology_day_data[country][tipology] = process_tipology(tipology_data)

    def averaged_country_tipology_day(self, timebin_size=7):
        def daterange(start_date, timebin_size):
            for n in range(timebin_size):
                yield start_date - datetime.timedelta(days=n)

        def process_tipology(tipology_data, timebin_size):

            daily_data = {}
            ordered_days = list(tipology_data.keys())
            ordered_days.sort()
            for day in ordered_days:
                day_bin = {
                    'oldest_day': day,
                    'most_recent_day': day,
                    'totalvalue': 0,
                    'averaged_value': None
                }
                for day_in_bin in daterange(day, timebin_size):
                    if day_in_bin in tipology_data:
                        day_bin['totalvalue'] += tipology_data[day_in_bin]
                        if day_in_bin > day_bin['most_recent_day']:
                            day_bin['most_recent_day'] = day_in_bin
                        if day_in_bin < day_bin['oldest_day']:
                            day_bin['oldest_day'] = day_in_bin

                    daily_data[day] = day_bin['totalvalue'] / ((day_bin['most_recent_day'] - day_bin['oldest_day']).days+1)

            return daily_data

        if not self.averaged_country_tipology_day_data:
            self.daily_country_tipology_day()
            self.averaged_country_tipology_day_data = {}

            for country, country_data in self.daily_country_tipology_day_data.items():
                self.averaged_country_tipology_day_data[country] = {
                }
                for tipology, tipology_data in country_data.items():
                    '''daily_data = {}
                    previous_day = None
                    ordered_days = list(tipology_data.keys())
                    ordered_days.sort()
                    for day in ordered_days:
                        if not previous_day:
                            daily_data[day] = tipology_data[day]
                        else:
                            daily_data[day] = tipology_data[day] - tipology_data[previous_day]

                        print(country, tipology, day, tipology_data[day], daily_data[day])

                        # at the end of the loop, day becomes previous_day
                        previous_day = day'''
                    self.averaged_country_tipology_day_data[country][tipology] = process_tipology(tipology_data, timebin_size)

    def plot_countries(self, countries, ax=None, json_save=False):
        if not ax and not json_save:
            fig, ax = plt.subplots()
            fig.autofmt_xdate()

            ax.set_xlabel('days')
            # ax.set_xticklabels([x.date() for x in x_list], rotation=45)

            ax.set_ylabel('individuals')

        if countries == 'all':
            countries = self.countries

        plots = []
        json_data = {}
        for country in countries:
            data_dict = self.get_daily_data_by_country(country=country)

            if json_save:
                json_data[country] = {
                    'confirmed': [],
                    'deaths': [],
                    'recovered': [],
                    'active': [],
                }
                for day in data_dict.keys():
                    json_data[country]['confirmed'].append({
                        'x': day.__str__(),
                        'y': int(data_dict[day]['Confirmed']),
                    })
                    json_data[country]['deaths'].append({
                        'x': day.__str__(),
                        'y': int(data_dict[day]['Deaths']),
                    })
                    json_data[country]['recovered'].append({
                        'x': day.__str__(),
                        'y': int(data_dict[day]['Recovered']),
                    })
                    json_data[country]['active'].append({
                        'x': day.__str__(),
                        'y': int(data_dict[day]['Active']) if 'Active' in data_dict[day] else int(data_dict[day]['Confirmed']) - int(data_dict[day]['Deaths']) - int(data_dict[day]['Recovered']),
                    })
            else:
                plot_lines = list(self.plot_lines)
                x_list = list(data_dict.keys())
                x_list.sort()

                plot_i, = ax.plot_date(
                    x_list,
                    [int(data_dict[day]['Confirmed']) - int(data_dict[day]['Deaths']) - int(data_dict[day]['Recovered'])
                     for day in x_list],
                    '.-')
                plots.append(plot_i)

        if json_save:
            with open('chartjs/data/plot_countries.json', 'w') as json_fp:
                json.dump(
                    json_data,
                    fp=json_fp,
                    default=json_serial
                )
        else:
            ax.legend(plots, countries)

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

    def weekly_data_per_capita(self, countries, ax=None):

        if countries == 'all':
            countries = self.countries

        json_data = {}
        weekly_data = {}
        labels = ['Confirmed',
                  'Deaths',
                  'Recovered',
                  'Active'
                  ]
        
        for country in countries:
            try:
                population = int(self.population_by_country[country]) \
                    if country in self.population_by_country \
                    else int(self.population_by_country[self.country_translation_wp[country]])

                if country in self.country_translation_wp and self.country_translation_wp[country] in countries:
                    print("aaaaa", country, self.country_translation_wp[country])
                data_dict = self.get_daily_data_by_country(country=country)

                weekly_data[country] = {
                    'confirmed': {},
                    'deaths': {},
                    'recovered': {},
                    'active': {},
                }

                ordered_days = list(data_dict.keys())
                ordered_days.sort()
                prev_day = {label: 0 for label in labels}
                for day in ordered_days:
                    week = day.isocalendar()[1]

                    for label in labels:
                        try:
                            value = int(data_dict[day][label])-prev_day[label]
                        except KeyError:
                            value = int(data_dict[day]['Confirmed']) - int(data_dict[day]['Deaths']) - int(
                                data_dict[day]['Recovered'])-prev_day[label]
                        prev_day[label] += value

                        if week in weekly_data[country][label.lower()]:
                            weekly_data[country][label.lower()][week].append(
                                value
                            )
                        else:
                            weekly_data[country][label.lower()][week] = [value]

                json_data[country] = {
                    'confirmed': [],
                    'deaths': [],
                    'recovered': [],
                    'active': [],
                }
                for label in labels:
                    for week in weekly_data[country][label.lower()]:
                        json_data[country][label.lower()].append({
                            'x': week,
                            'y': sum(weekly_data[country][label.lower()][week])/population*100000*7/len(weekly_data[country][label.lower()][week]),
                        })

            except (KeyError, ValueError):
                if country not in self.population_by_country:
                    print(country)
        with open('chartjs/data/weekly_data_per_capita.json', 'w') as json_fp:
            json.dump(
                json_data,
                fp=json_fp,
                default=json_serial
            )

    def daily_data_per_capita(self, countries):

        if countries == 'all':
            countries = self.countries

        self.daily_country_tipology_day()

        data_to_process = self.cumulative_country_tipology_day_data
        json_data = {}
        for country in countries:
            try:
                population = int(self.population_by_country[country]) \
                    if country in self.population_by_country \
                    else int(self.population_by_country[self.country_translation_wp[country]])

                if country in self.country_translation_wp and self.country_translation_wp[country] in countries:
                    print("aaaaa", country, self.country_translation_wp[country])
                data_dict = self.get_daily_data_by_country(country=country)

                json_data[country] = {
                    'confirmed': [],
                    'deaths': [],
                    'recovered': [],
                    'active': [],
                }
                for label in json_data[country].keys():
                    for day in data_to_process[country][label]:
                        json_data[country][label.lower()].append({
                            'x': day,
                            'y': data_to_process[country][label][day],
                            #'y': data_to_process[country][label][day] / population * 100000,
                        })
            except (KeyError, ValueError):
                if country not in self.population_by_country:
                    print(country)

        with open('chartjs/data/daily_data_per_capita.json', 'w') as json_fp:
            json.dump(
                json_data,
                fp=json_fp,
                default=json_serial
            )

    def daily_data_per_capita_average(self, countries):

        if countries == 'all':
            countries = self.countries
        self.averaged_country_tipology_day(7)

        json_data = {}
        for country in countries:
            try:
                population = int(self.population_by_country[country]) \
                    if country in self.population_by_country \
                    else int(self.population_by_country[self.country_translation_wp[country]])

                if country in self.country_translation_wp and self.country_translation_wp[country] in countries:
                    print("aaaaa", country, self.country_translation_wp[country])
                data_dict = self.get_daily_data_by_country(country=country)

                json_data[country] = {
                    'confirmed': [],
                    'deaths': [],
                    'recovered': [],
                    'active': [],
                }
                for label in json_data[country].keys():
                    for day in self.averaged_country_tipology_day_data[country][label]:
                        json_data[country][label.lower()].append({
                            'x': day,
                            'y': self.averaged_country_tipology_day_data[country][label][day] / population * 100000,
                        })
            except (KeyError, ValueError):
                if country not in self.population_by_country:
                    print(country)

        with open('chartjs/data/daily_data_per_capita_average.json', 'w') as json_fp:
            json.dump(
                json_data,
                fp=json_fp,
                default=json_serial
            )

    def __init__(self):
        self.daily_data, self.countries = self.get_daily_data()
        self.cumulative_country_tipology_day_data = None
        self.daily_country_tipology_day_data = None
        self.averaged_country_tipology_day_data = None


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
    wp = WorldPopulation()
    only_json = True
    test = False
    dpc_covid_data = DpcCovidData()
    covid_data = CssegiCovidData()

    if test:
        covid_data.daily_data_per_capita_averaged('all')

    elif only_json:
        dpc_covid_data.roma_analysis(json_save=True)
        dpc_covid_data.italia_analysis(json_save=True)
        dpc_covid_data.plot_newcases_vs_totalcases_regioni(
            'all', # ['Lombardia', 'Lazio', 'Veneto', 'Toscana', 'Emilia-Romagna', 'Calabria', 'Umbria', 'Marche', 'Piemonte']
            json_save=True
        )
        dpc_covid_data.plot_province_per_regione(regioni='all', json_save=True)
        dpc_covid_data.nuovi_malati_per_regione(regioni='all', json_save=True)
        dpc_covid_data.save_data_regioni(regioni='all')
        dpc_covid_data.tamponi_data(regioni='all')
        dpc_covid_data.roma_analysis(json_save=True)
        dpc_covid_data.italia_analysis(json_save=True)
        
        covid_data.plot_newcases_vs_totalcases(
            'all',  # ['Italy', 'Spain', 'Iran', 'United States of America', 'South Korea', 'United Kingdom', 'Japan'],
            json_save=True
        )
        covid_data.plot_countries(
            'all',
            json_save=True
        )
        covid_data.weekly_data_per_capita('all')
        covid_data.daily_data_per_capita('all')
        covid_data.daily_data_per_capita_average('all')
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
        #covid_data.plot_newcases_vs_totalcases(
        #    ['Italy', 'Spain', 'Iran', 'United States of America', 'South Korea', 'United Kingdom', 'Japan'],
        #    ax3)
        covid_data.plot_countries2(
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
